import { motion } from 'motion/react';
import {
  X, Lock, ShieldAlert, ArrowRight, Fingerprint, CreditCard,
  Building, CheckCircle2, Plus, Coins, Wallet, Globe
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { LinkedPaymentMethod } from '../../pages/dashboard/Settings';

const CRYPTO_COINS = [
  { symbol: 'BTC', name: 'Bitcoin (BTC)', network: 'Bitcoin Mainnet' },
  { symbol: 'ETH', name: 'Ethereum (ETH)', network: 'ERC-20' },
  { symbol: 'USDT', name: 'Tether (USDT)', network: 'ERC-20 / TRC-20' },
  { symbol: 'USDC', name: 'USD Coin (USDC)', network: 'ERC-20 / Solana' },
  { symbol: 'SOL', name: 'Solana (SOL)', network: 'Solana Mainnet' },
];

export function WithdrawModal({
  isOpen,
  onClose,
  onRequireSupport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRequireSupport: (msg: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedDest, setSelectedDest] = useState<string>('');
  const [linkedMethods, setLinkedMethods] = useState<LinkedPaymentMethod[]>([]);

  // Inline Add New Withdrawal Method state
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'card' | 'crypto' | 'paypal' | 'bank' | 'other'>('card');
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoNetwork, setCryptoNetwork] = useState('Bitcoin Mainnet');
  const [walletAddress, setWalletAddress] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [otherMethodName, setOtherMethodName] = useState('');
  const [otherAccountRef, setOtherAccountRef] = useState('');
  const [savingMethod, setSavingMethod] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user, profile, updateUserBalance } = useAuth();

  useEffect(() => {
    if (!user || !isOpen) return;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'cards'),
      (snap) => {
        const list: LinkedPaymentMethod[] = [];
        snap.forEach((d) => list.push(d.data() as LinkedPaymentMethod));
        list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        setLinkedMethods(list);
        if (list.length > 0 && !selectedDest) {
          setSelectedDest(list[0].id);
        } else if (list.length === 0 && !selectedDest) {
          setSelectedDest('quick_crypto_btc');
        }
      },
      () => {}
    );
    return () => unsub();
  }, [user, isOpen]);

  if (!isOpen) return null;

  const availableCash = Number(profile?.cashBalance ?? 0);
  const currentTotal = Number(profile?.totalBalance ?? 0);

  const handleSaveInlineDestination = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingMethod(true);
    setError('');

    try {
      const id = `pm_${Date.now()}`;
      const defaultHolder =
        holderName.trim() ||
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
        'Account Holder';

      let newMethod: LinkedPaymentMethod;

      if (newMethodType === 'card') {
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.length < 12) {
          setError('Please enter a valid bank card number for withdrawal.');
          setSavingMethod(false);
          return;
        }
        const brand = digits.startsWith('4')
          ? 'Visa Card'
          : /^5[1-5]/.test(digits)
          ? 'Mastercard'
          : /^3[47]/.test(digits)
          ? 'American Express'
          : 'Bank Card';
        newMethod = {
          id,
          userId: user.uid,
          methodType: 'card',
          brand,
          holderName: defaultHolder,
          last4: digits.slice(-4),
          expiry: cardExpiry || 'Card Payout',
          isDefault: linkedMethods.length === 0,
          createdAt: new Date().toISOString(),
        };
      } else if (newMethodType === 'crypto') {
        if (!walletAddress.trim() || walletAddress.trim().length < 8) {
          setError('Please enter a valid crypto / coin wallet address.');
          setSavingMethod(false);
          return;
        }
        const addr = walletAddress.trim();
        newMethod = {
          id,
          userId: user.uid,
          methodType: 'crypto',
          brand: `${cryptoSymbol} (${cryptoNetwork})`,
          holderName: addr,
          last4: addr.slice(-6),
          expiry: cryptoNetwork,
          details: addr,
          isDefault: linkedMethods.length === 0,
          createdAt: new Date().toISOString(),
        };
      } else if (newMethodType === 'paypal') {
        if (!paypalEmail.trim() || !paypalEmail.includes('@')) {
          setError('Please enter a valid PayPal email address.');
          setSavingMethod(false);
          return;
        }
        newMethod = {
          id,
          userId: user.uid,
          methodType: 'paypal',
          brand: 'PayPal',
          holderName: paypalEmail.trim(),
          last4: paypalEmail.trim().slice(0, 6),
          expiry: 'Instant PayPal Payout',
          details: paypalEmail.trim(),
          isDefault: linkedMethods.length === 0,
          createdAt: new Date().toISOString(),
        };
      } else if (newMethodType === 'bank') {
        const cleanAcct = accountNumber.replace(/\D/g, '');
        if (!bankName.trim() || cleanAcct.length < 4) {
          setError('Please enter bank institution name and account number.');
          setSavingMethod(false);
          return;
        }
        newMethod = {
          id,
          userId: user.uid,
          methodType: 'bank',
          brand: bankName.trim(),
          holderName: defaultHolder,
          last4: cleanAcct.slice(-4),
          expiry: routingNumber ? `RTN ••${routingNumber.slice(-4)}` : 'ACH / Wire',
          isDefault: linkedMethods.length === 0,
          createdAt: new Date().toISOString(),
        };
      } else {
        if (!otherMethodName.trim() || !otherAccountRef.trim()) {
          setError('Please enter the withdrawal provider and destination account.');
          setSavingMethod(false);
          return;
        }
        newMethod = {
          id,
          userId: user.uid,
          methodType: 'other',
          brand: otherMethodName.trim(),
          holderName: otherAccountRef.trim(),
          last4: otherAccountRef.trim().slice(-4),
          expiry: 'External Payout',
          details: otherAccountRef.trim(),
          isDefault: linkedMethods.length === 0,
          createdAt: new Date().toISOString(),
        };
      }

      await setDoc(doc(db, 'users', user.uid, 'cards', id), newMethod);
      setSelectedDest(id);
      setShowAddMethodForm(false);
      setHolderName('');
      setCardNumber('');
      setCardExpiry('');
      setWalletAddress('');
      setPaypalEmail('');
      setBankName('');
      setRoutingNumber('');
      setAccountNumber('');
      setOtherMethodName('');
      setOtherAccountRef('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/cards`);
    } finally {
      setSavingMethod(false);
    }
  };

  const handleNext = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (val > availableCash) {
      setError(
        `Insufficient available cash balance ($${availableCash.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}).`
      );
      return;
    }
    setError('');
    setStep(2);
  };

  const handleVerify = async () => {
    if (pin.length < 4) {
      setError('Please enter your 4 to 6 digit security PIN (or default 123456).');
      return;
    }
    setSubmitting(true);
    setError('');
    const val = parseFloat(amount);

    if (user && val > 0) {
      try {
        const chosenMethod = linkedMethods.find((m) => m.id === selectedDest);
        let destLabel = 'Institutional Payout';
        if (chosenMethod) {
          destLabel =
            chosenMethod.methodType === 'crypto'
              ? `Crypto Withdrawal to ${chosenMethod.brand} (${chosenMethod.last4})`
              : chosenMethod.methodType === 'paypal'
              ? `PayPal Withdrawal (${chosenMethod.holderName})`
              : `Withdrawal to ${chosenMethod.brand} •••• ${chosenMethod.last4}`;
        } else if (selectedDest === 'quick_crypto_btc') {
          destLabel = 'Coins / Crypto Asset Withdrawal (BTC/USDT)';
        } else if (selectedDest === 'quick_paypal') {
          destLabel = 'PayPal Account Withdrawal';
        } else if (selectedDest === 'quick_wire') {
          destLabel = 'Bank Wire / ACH Settlement';
        }

        const txId = 'tx_' + Date.now();
        await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
          id: txId,
          userId: user.uid,
          type: 'withdrawal',
          amount: val,
          assetName: destLabel,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });

        await updateUserBalance({
          cashBalance: Math.max(0, availableCash - val),
          totalBalance: Math.max(0, currentTotal - val),
        });
        setStep(3);
      } catch (err) {
        console.error('Error executing withdrawal:', err);
        setError('Could not complete withdrawal. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
    }
  };

  const getMethodIcon = (type?: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'crypto':
        return <Coins className="w-4 h-4" />;
      case 'paypal':
        return <Wallet className="w-4 h-4" />;
      case 'bank':
        return <Building className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" /> Withdraw Vault Funds
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Withdraw via Bank Cards, Coins & Crypto Assets, PayPal, Bank Wire, or Other Payout Means
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Select Withdrawal Destination
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMethodForm(!showAddMethodForm);
                    setError('');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />{' '}
                  {showAddMethodForm ? 'Cancel' : 'Add Card / Crypto / PayPal / Bank'}
                </button>
              </div>

              {showAddMethodForm ? (
                <form
                  onSubmit={handleSaveInlineDestination}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mb-2"
                >
                  <div className="text-xs font-bold text-slate-900">
                    Link New Withdrawal Destination
                  </div>

                  {/* Method Type Selector */}
                  <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/70 rounded-xl text-[11px] font-semibold">
                    {[
                      { id: 'card' as const, label: 'Card' },
                      { id: 'crypto' as const, label: 'Coins/Crypto' },
                      { id: 'paypal' as const, label: 'PayPal' },
                      { id: 'bank' as const, label: 'Bank Wire' },
                      { id: 'other' as const, label: 'Other' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setNewMethodType(tab.id);
                          setError('');
                        }}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                          newMethodType === tab.id
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {newMethodType === 'card' && (
                    <div className="space-y-2.5">
                      <input
                        required
                        type="text"
                        placeholder="Cardholder Name"
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <input
                        required
                        type="text"
                        maxLength={19}
                        placeholder="Bank Card Number (Visa, Mastercard, Amex)"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                          let formatted = '';
                          for (let i = 0; i < val.length; i++) {
                            if (i > 0 && i % 4 === 0) formatted += ' ';
                            formatted += val[i];
                          }
                          setCardNumber(formatted);
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="Expiry (MM/YY)"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                          setCardExpiry(val);
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tabular-nums outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  {newMethodType === 'crypto' && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={cryptoSymbol}
                          onChange={(e) => {
                            const found = CRYPTO_COINS.find((c) => c.symbol === e.target.value);
                            setCryptoSymbol(e.target.value);
                            if (found) setCryptoNetwork(found.network);
                          }}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                        >
                          {CRYPTO_COINS.map((c) => (
                            <option key={c.symbol} value={c.symbol}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={cryptoNetwork}
                          onChange={(e) => setCryptoNetwork(e.target.value)}
                          placeholder="Network (e.g. ERC-20)"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Destination Coin / Crypto Wallet Address (0x... or bc1...)"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  {newMethodType === 'paypal' && (
                    <div className="space-y-2.5">
                      <input
                        required
                        type="email"
                        placeholder="PayPal Account Email Address"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  {newMethodType === 'bank' && (
                    <div className="space-y-2.5">
                      <input
                        required
                        type="text"
                        placeholder="Bank / Institution Name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Routing / SWIFT"
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                        />
                        <input
                          required
                          type="text"
                          placeholder="Account Number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {newMethodType === 'other' && (
                    <div className="space-y-2.5">
                      <input
                        required
                        type="text"
                        placeholder="Withdrawal Channel (e.g. Wise, Revolut, Skrill, Sovereign Bullion)"
                        value={otherMethodName}
                        onChange={(e) => setOtherMethodName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Recipient Account ID / Handle / Tag"
                        value={otherAccountRef}
                        onChange={(e) => setOtherAccountRef(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingMethod}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {savingMethod ? 'Saving Withdrawal Destination...' : 'Save & Select Withdrawal Method'}
                  </button>
                </form>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {linkedMethods.map((pm) => {
                    const active = selectedDest === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedDest(pm.id)}
                        className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer ${
                          active
                            ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-slate-900 text-amber-400 rounded-lg flex items-center justify-center shrink-0">
                            {getMethodIcon(pm.methodType)}
                          </div>
                          <div className="text-left min-w-0">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                              {pm.methodType === 'crypto' || pm.methodType === 'paypal'
                                ? pm.brand
                                : `${pm.brand} •••• ${pm.last4}`}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{pm.holderName}</div>
                          </div>
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

                  {/* Built-in Withdrawal Channels */}
                  {[
                    {
                      id: 'quick_crypto_btc',
                      title: 'Coins & Crypto Assets (BTC, ETH, USDT, USDC, SOL)',
                      sub: 'Direct blockchain withdrawal to external wallet',
                      icon: Coins,
                    },
                    {
                      id: 'quick_paypal',
                      title: 'PayPal Instant Withdrawal',
                      sub: 'Payout to verified PayPal account',
                      icon: Wallet,
                    },
                    {
                      id: 'quick_wire',
                      title: 'Bank Wire / ACH Settlement',
                      sub: 'Direct transfer to external bank account',
                      icon: Building,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = selectedDest === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedDest(item.id)}
                        className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer ${
                          active
                            ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">{item.title}</div>
                            <div className="text-xs text-slate-500">{item.sub}</div>
                          </div>
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
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Withdrawal Amount (USD)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(String(availableCash))}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-0.5 rounded cursor-pointer font-mono tabular-nums"
                >
                  Max: ${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                <input
                  type="number"
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
              <p className="text-xs text-slate-500 mt-2 tabular-nums">
                Available cash to withdraw:{' '}
                <span className="font-semibold text-slate-800">
                  ${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={handleNext}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                Continue to Verification <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequireSupport(
                    `Hello ${profile?.assignedAgentName || 'Advisor'}, I would like assistance with a withdrawal request.`
                  );
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Need assistance? Coordinate Withdrawal with Advisor in Chat
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Authorize Withdrawal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your 6-digit security PIN to authorize this transfer of{' '}
                <span className="font-bold text-slate-900 tabular-nums">${Number(amount).toLocaleString()}</span> (default PIN: 123456).
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-start gap-2 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full text-center tracking-[0.75em] py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xl font-bold font-mono tabular-nums"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={pin.length < 4 || submitting}
                className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" /> {submitting ? 'Authorizing...' : 'Authorize & Transfer'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-heading text-slate-900 mb-1">Withdrawal Dispatched</h3>
              <p className="text-slate-500 text-sm">
                Your withdrawal of{' '}
                <span className="font-bold text-slate-900 tabular-nums">${Number(amount).toLocaleString()}</span> has been processed and deducted from your cash balance.
              </p>
            </div>
            <button
              onClick={() => {
                setStep(1);
                setAmount('');
                setPin('');
                onClose();
              }}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
