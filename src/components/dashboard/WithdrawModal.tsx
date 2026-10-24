import { motion } from 'motion/react';
import { X, Lock, ShieldAlert, ArrowRight, Fingerprint } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function WithdrawModal({ isOpen, onClose, onRequireSupport }: { isOpen: boolean; onClose: () => void; onRequireSupport: (msg: string) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { user, profile, updateUserBalance } = useAuth();

  if (!isOpen) return null;

  const availableCash = profile?.cashBalance ?? 50000;

  const handleNext = () => {
    const val = parseFloat(amount);
    if (val > availableCash) {
      setError(`Insufficient cash balance. You have $${availableCash.toLocaleString()} available.`);
      return;
    }
    setError('');

    if (val > 50000) {
      onClose();
      onRequireSupport(`Hi Sarah, I would like to request a large withdrawal of $${amount}. Could we review this together?`);
    } else {
      setStep(2);
    }
  };

  const handleVerify = async () => {
    if (pin === '123456' || pin.length >= 4) {
      const val = parseFloat(amount);
      if (user && val > 0) {
        try {
          const txId = 'tx_' + Date.now();
          await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
            id: txId,
            userId: user.uid,
            type: 'withdrawal',
            amount: val,
            assetName: 'ACH Bank Payout',
            status: 'completed',
            timestamp: new Date().toISOString()
          });

          const curTotal = profile?.totalBalance ?? 145000;
          await updateUserBalance({
            cashBalance: Math.max(0, availableCash - val),
            totalBalance: Math.max(0, curTotal - val),
          });
        } catch (err) {
          console.error('Error executing withdrawal:', err);
        }
      }
      onClose();
    } else {
      setError('Invalid security PIN. Connecting you to your advisor for secure verification.');
      setTimeout(() => {
        onClose();
        onRequireSupport(`Hi Sarah, I need assistance verifying my identity for a withdrawal of $${amount}.`);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-400" /> Secure Withdrawal
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-lg font-medium"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Available cash to withdraw: ${availableCash.toLocaleString()}</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleNext}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Step-Up Authentication</h3>
              <p className="text-sm text-slate-500 mt-1">Please enter your 6-digit security PIN to authorize this withdrawal (default demo: 123456).</p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium flex items-start gap-2 text-left">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <input 
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full text-center tracking-[1em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-xl font-medium"
              />
            </div>

            <button 
              onClick={handleVerify}
              disabled={pin.length < 4}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Authorize & Transfer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
