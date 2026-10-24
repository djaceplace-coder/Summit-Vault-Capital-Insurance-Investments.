import { motion } from 'motion/react';
import { X, Building, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function DepositModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const { user, profile, updateUserBalance } = useAuth();

  const handleConfirmDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    
    if (user) {
      try {
        const txId = 'tx_' + Date.now();
        await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
          id: txId,
          userId: user.uid,
          type: 'deposit',
          amount: val,
          assetName: 'USD Cash Transfer',
          status: 'completed',
          timestamp: new Date().toISOString()
        });

        const curCash = profile?.cashBalance ?? 50000;
        const curTotal = profile?.totalBalance ?? 145000;
        await updateUserBalance({
          cashBalance: curCash + val,
          totalBalance: curTotal + val
        });
      } catch (err) {
        console.error('Error recording deposit:', err);
      }
    }
    setStep(2);
  };

  if (!isOpen) return null;

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
          <h2 className="text-xl font-bold font-heading text-slate-900">Fund Account</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Funding Source</label>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-900 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-900">Bank Transfer (ACH)</div>
                      <div className="text-sm text-slate-500">Connect via Plaid</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-900 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-900">Wire Transfer</div>
                      <div className="text-sm text-slate-500">1-2 business days</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Deposit Amount</label>
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
            </div>

            <button 
              onClick={handleConfirmDeposit}
              disabled={!amount}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Deposit Funds
            </button>
          </div>
        ) : (
          <div className="p-6 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">Deposit Initiated</h3>
              <p className="text-slate-500">Your deposit of <span className="font-bold text-slate-900">${amount}</span> is currently processing.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 text-left">
              Funds will be available in your account within 1-2 business days depending on your financial institution.
            </div>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
