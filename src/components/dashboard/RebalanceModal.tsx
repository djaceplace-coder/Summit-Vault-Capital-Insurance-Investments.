import { motion } from 'motion/react';
import { X, Sliders, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export function RebalanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [allocations, setAllocations] = useState({
    equities: 60,
    bonds: 25,
    crypto: 10,
    cash: 5,
  });

  if (!isOpen) return null;

  const total = Object.values(allocations).reduce((a: number, b: number) => a + b, 0);
  const portfolioBase = Number(profile?.investedAmount ?? 0) || Number(profile?.totalBalance ?? 0);

  const handleSliderChange = (asset: keyof typeof allocations, value: number) => {
    setAllocations((prev) => ({ ...prev, [asset]: value }));
  };

  const handleExecuteRebalance = async () => {
    setSubmitting(true);
    try {
      if (user && portfolioBase > 0) {
        const txId = `tx_${Date.now()}`;
        await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
          id: txId,
          userId: user.uid,
          type: 'buy',
          amount: portfolioBase,
          assetName: `Portfolio Rebalance (${allocations.equities}% Eq / ${allocations.bonds}% FI / ${allocations.crypto}% DA)`,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });
      }
      setStep(3);
    } catch (e) {
      console.error('Error recording rebalance:', e);
    } finally {
      setSubmitting(false);
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
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">Rebalance Portfolio</h2>
            <p className="text-xs text-slate-500 mt-0.5">Adjust your target institutional asset weights</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-sm">Target Weight Total</span>
              </div>
              <span className={`font-bold font-mono tabular-nums ${total !== 100 ? 'text-red-600' : 'text-emerald-600'}`}>
                {total}%
              </span>
            </div>

            <div className="space-y-5">
              {[
                { key: 'equities', label: 'Global Equities', color: 'bg-slate-900' },
                { key: 'bonds', label: 'Fixed Income & Sovereign Bonds', color: 'bg-emerald-600' },
                { key: 'crypto', label: 'Digital Vault Assets', color: 'bg-amber-500' },
                { key: 'cash', label: 'Liquid Cash Reserves', color: 'bg-slate-400' },
              ].map((asset) => {
                const pct = allocations[asset.key as keyof typeof allocations];
                const dollarEst = Math.round((portfolioBase * pct) / 100);
                return (
                  <div key={asset.key} className="space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${asset.color}`} />
                        <span className="text-slate-800 font-semibold">{asset.label}</span>
                      </div>
                      <span className="text-slate-900 font-mono tabular-nums font-bold">
                        {pct}% (${dollarEst.toLocaleString()})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={pct}
                      onChange={(e) =>
                        handleSliderChange(asset.key as keyof typeof allocations, parseInt(e.target.value, 10))
                      }
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
                );
              })}
            </div>

            {total !== 100 && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Target allocations must add up to 100% (currently {total}%).</p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={total !== 100}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              Review Proposed Allocation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 flex-1 flex flex-col space-y-6">
            <div className="flex-1 overflow-y-auto space-y-5">
              <div className="text-center">
                <h3 className="text-lg font-bold font-heading text-slate-900">Confirm Target Weights</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Your portfolio of <span className="font-bold text-slate-900 tabular-nums">${portfolioBase.toLocaleString()}</span> will be aligned to these target weights.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Global Equities (VTI / AAPL / MSFT)', pct: allocations.equities },
                  { label: 'Fixed Income (US Treasury Bills)', pct: allocations.bonds },
                  { label: 'Digital Vault Assets (BTC / USDC)', pct: allocations.crypto },
                  { label: 'Cash Reserves (USD Custody)', pct: allocations.cash },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums">
                      {item.pct}% (${Math.round((portfolioBase * item.pct) / 100).toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleExecuteRebalance}
                disabled={submitting}
                className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Executing...' : 'Confirm & Rebalance'}
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
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">Portfolio Rebalanced</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Your target asset allocation has been updated and logged in your transaction ledger.
              </p>
            </div>
            <button
              onClick={() => {
                setStep(1);
                onClose();
              }}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
