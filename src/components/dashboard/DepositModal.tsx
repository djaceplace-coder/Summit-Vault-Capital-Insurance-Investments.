import { motion } from 'motion/react';
import { X, ShieldCheck, MessageSquare, ArrowRight, Building2, Coins, Wallet, Globe, FileText } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAgents } from '../../lib/agentsData';

const DEPOSIT_ORIGINS = [
  { id: 'Bank Wire / ACH Transfer', label: 'Bank Wire / ACH Transfer', icon: Building2, placeholder: 'e.g. JPMorgan Chase, Citi, Bank of America' },
  { id: 'Coins & Crypto Assets', label: 'Coins & Crypto Assets (BTC, ETH, USDT, SOL)', icon: Coins, placeholder: 'e.g. Bitcoin (BTC), USDT (ERC-20), Ledger / Coinbase' },
  { id: 'PayPal Transfer', label: 'PayPal / Digital Remittance', icon: Wallet, placeholder: 'e.g. Verified PayPal Account / Institutional Remittance' },
  { id: 'External Brokerage Transfer', label: 'External Brokerage / Custodian', icon: Globe, placeholder: 'e.g. Fidelity, Charles Schwab, Interactive Brokers' },
  { id: 'Other Funding Origin', label: 'Other Institutional / Private Source', icon: FileText, placeholder: 'Specify bank, institution, or funding channel' },
];

const DEPOSIT_REASONS = [
  'Portfolio Capital Allocation (Equities & ETFs)',
  'Coins & Digital Asset Vault Custody',
  'Fixed Income & Sovereign Bond Reserve',
  'Insurance Policy Underwriting & Premium Reserve',
  'General Private Vault Deposit',
  'Custom / Specific Account Directive',
];

export function DepositModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, profile } = useAuth();
  const { agents } = useAgents();
  const activeAgents = agents.filter((a) => a.status === 'Active');

  const [originType, setOriginType] = useState<string>(DEPOSIT_ORIGINS[0].id);
  const [originDetail, setOriginDetail] = useState<string>('');
  const [reasonPreset, setReasonPreset] = useState<string>(DEPOSIT_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    profile?.assignedAgentId || 'AG-001'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedOriginObj =
    DEPOSIT_ORIGINS.find((o) => o.id === originType) || DEPOSIT_ORIGINS[0];
  const chosenAgent =
    activeAgents.find((a) => a.id === selectedAgentId) ||
    activeAgents[0] ||
    agents[0];

  const handleRouteToFundingAgent = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Please enter a valid deposit amount in USD.');
      return;
    }

    const finalOrigin = originDetail.trim()
      ? `${originType} (${originDetail.trim()})`
      : originType;
    const finalReason =
      reasonPreset === 'Custom / Specific Account Directive'
        ? customReason.trim() || 'Vault Capital Deposit'
        : customReason.trim()
        ? `${reasonPreset} — ${customReason.trim()}`
        : reasonPreset;

    if (!user) return;
    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const clientName =
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
        user.email ||
        'Client';

      const formattedMessage = `FUNDING REQUEST — $${val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USD\n• Depositing From: ${finalOrigin}\n• Reason for Deposit: ${finalReason}\n• Requested Amount: $${val.toLocaleString(
        'en-US',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}\n\nPlease provide official funding coordinates and settlement instructions for this deposit.`;

      // 1. Write the structured funding_request message into the client's 2-way chat thread
      await setDoc(doc(db, 'chats', user.uid, 'messages', msgId), {
        id: msgId,
        userId: user.uid,
        senderRole: 'client',
        senderName: clientName,
        agentId: chosenAgent?.id || 'AG-001',
        agentName: chosenAgent?.name || 'Sarah Jenkins',
        agentRole: chosenAgent?.role || 'Funding & Wealth Specialist',
        agentAvatar: chosenAgent?.img || '',
        messageType: 'funding_request',
        fundingOrigin: finalOrigin,
        fundingReason: finalReason,
        fundingAmount: val,
        text: formattedMessage,
        createdAt: now,
      });

      // 2. Get current unreadByAdmin count so we increment accurately with zero lag
      const chatRef = doc(db, 'chats', user.uid);
      const chatSnap = await getDoc(chatRef);
      const currentUnreadAdmin = chatSnap.exists()
        ? Number(chatSnap.data()?.unreadByAdmin || 0)
        : 0;

      await setDoc(
        chatRef,
        {
          userId: user.uid,
          userEmail: profile?.email || user.email || '',
          userName: clientName,
          selectedAgentId: chosenAgent?.id || 'AG-001',
          selectedAgentName: chosenAgent?.name || 'Sarah Jenkins',
          selectedAgentRole: chosenAgent?.role || 'Funding & Wealth Specialist',
          selectedAgentAvatar: chosenAgent?.img || '',
          lastMessage: `Funding Request: $${val.toLocaleString()} from ${finalOrigin}`,
          lastMessageAt: now,
          unreadByAdmin: currentUnreadAdmin + 1,
          updatedAt: now,
        },
        { merge: true }
      );

      // 3. Log a pending deposit entry in the client's transaction ledger for visibility
      const txId = `tx_${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
        id: txId,
        userId: user.uid,
        type: 'deposit',
        amount: val,
        assetName: `${finalOrigin} · ${finalReason}`,
        status: 'pending',
        timestamp: now,
      });

      setSubmitting(false);
      onClose();

      // 4. Immediately route user to the Funding Agent in the live chat box
      window.dispatchEvent(
        new CustomEvent('svc:open-agent-chat', {
          detail: {
            agentId: chosenAgent?.id || 'AG-001',
          },
        })
      );
    } catch (err) {
      setSubmitting(false);
      handleFirestoreError(err, OperationType.WRITE, `chats/${user.uid}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col border border-slate-100"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-950 text-white">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Fiduciary Deposit Desk
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              Fund Vault Account
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit your funding details below to connect immediately with a Funding Agent in live chat.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRouteToFundingAgent} className="p-6 space-y-5 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
            <strong className="font-bold">Security Protocol Notice:</strong> Bank cards are strictly reserved for account withdrawals alongside Coins, Crypto Assets, PayPal, and Wire payouts. All account funding is coordinated directly through your dedicated Funding Agent in the live chat box.
          </div>

          {/* 1. Where They Are Depositing From */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              1. Where Are You Depositing From? *
            </label>
            <div className="grid grid-cols-1 gap-2 mb-3">
              {DEPOSIT_ORIGINS.map((orig) => {
                const Icon = orig.icon;
                const active = originType === orig.id;
                return (
                  <button
                    key={orig.id}
                    type="button"
                    onClick={() => setOriginType(orig.id)}
                    className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all text-left cursor-pointer ${
                      active
                        ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {orig.label}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        active ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                      }`}
                    >
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={originDetail}
              onChange={(e) => setOriginDetail(e.target.value)}
              placeholder={selectedOriginObj.placeholder}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* 2. Reason for Deposit */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              2. Reason for Deposit *
            </label>
            <select
              value={reasonPreset}
              onChange={(e) => setReasonPreset(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white mb-2.5"
            >
              {DEPOSIT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Optional additional note or allocation reference..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* 3. Deposit Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              3. Deposit Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                $
              </span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-lg font-bold font-mono tabular-nums"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[1000, 5000, 10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer font-mono tabular-nums"
                >
                  +${preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Funding Agent Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned Funding Agent
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {activeAgents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} — {ag.role}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || submitting}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>
              {submitting
                ? 'Routing to Funding Agent...'
                : `Route ${amount ? `$${Number(amount).toLocaleString()}` : 'Request'} to Funding Agent`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
