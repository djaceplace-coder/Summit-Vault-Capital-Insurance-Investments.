import { AnimatePresence } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Search, Download, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { DepositModal } from '../../components/dashboard/DepositModal';
import { WithdrawModal } from '../../components/dashboard/WithdrawModal';

export interface TxItem {
  id: string;
  type: string;
  amount: number;
  asset?: string;
  date: string;
  status: string;
  description: string;
}

export function Transactions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const txColRef = collection(db, 'users', user.uid, 'transactions');
    const unsub = onSnapshot(
      txColRef,
      (snapshot) => {
        const liveTxs: TxItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          liveTxs.push({
            id: d.id || docSnap.id,
            type: d.type || 'deposit',
            amount: Number(d.amount ?? 0),
            asset: d.assetName,
            date: d.timestamp || new Date().toISOString(),
            status: d.status || 'completed',
            description: d.assetName
              ? `${String(d.type).toUpperCase()} · ${d.assetName}`
              : `${String(d.type).toUpperCase()} Transfer`,
          });
        });
        liveTxs.sort((a, b) => b.date.localeCompare(a.date));
        setTransactions(liveTxs);
        setLoading(false);
      },
      (err) => {
        console.warn('Transactions snapshot warning:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (
      search &&
      !t.description.toLowerCase().includes(search.toLowerCase()) &&
      !(t.asset || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const rows = [
      ['Transaction ID', 'Type', 'Description', 'Amount (USD)', 'Status', 'Date'],
      ...filteredTransactions.map((tx) => [
        tx.id,
        tx.type,
        `"${tx.description}"`,
        tx.amount.toFixed(2),
        tx.status,
        tx.date,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'summit-vault-transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'buy':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'sell':
        return <RefreshCw className="w-5 h-5 text-amber-600" />;
      default:
        return <ArrowDownLeft className="w-5 h-5 text-slate-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-emerald-50';
      case 'withdrawal':
        return 'bg-red-50';
      case 'buy':
        return 'bg-blue-50';
      case 'sell':
        return 'bg-amber-50';
      default:
        return 'bg-slate-50';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'sell':
      case 'dividend':
        return 'text-emerald-600';
      default:
        return 'text-slate-900';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const isPositive = ['deposit', 'sell', 'dividend'].includes(type);
    return `${isPositive ? '+' : '-'}$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1">Transactions Ledger</h1>
          <p className="text-slate-500 text-sm">Real-time history of deposits, withdrawals, and portfolio allocations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
          >
            Withdraw
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Fund Account
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4 sm:space-y-0 sm:flex items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ledger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'deposit', label: 'Deposits' },
              { id: 'withdrawal', label: 'Withdrawals' },
              { id: 'buy', label: 'Buys' },
              { id: 'sell', label: 'Sells' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  filter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold first:pl-6">Transaction</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                    Synchronizing ledger...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="text-slate-900 font-bold text-sm mb-1">No Transactions Found</div>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto mb-5">
                      Your ledger is currently empty. Make a deposit or execute an investment to record your first transaction.
                    </p>
                    <button
                      onClick={() => setShowDepositModal(true)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Fund Account Now
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 first:pl-6">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(tx.type)}`}>
                          {getIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 capitalize">
                            {tx.type} {tx.asset ? `· ${tx.asset}` : ''}
                          </div>
                          <div className="text-xs text-slate-500">{tx.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 text-xs sm:text-sm tabular-nums">
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold capitalize text-emerald-700">
                        {tx.status}
                      </span>
                    </td>
                    <td className={`p-4 text-right pr-6 font-bold font-mono tabular-nums ${getAmountColor(tx.type)}`}>
                      {formatAmount(tx.amount, tx.type)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showDepositModal && <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />}
        {showWithdrawModal && (
          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            onRequireSupport={(msg) => openAgentChat(msg)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
