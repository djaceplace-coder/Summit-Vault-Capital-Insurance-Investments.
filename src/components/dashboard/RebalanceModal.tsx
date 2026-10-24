import { motion } from 'motion/react';
import { X, Sliders, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function RebalanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [allocations, setAllocations] = useState({
    equities: 60,
    bonds: 25,
    crypto: 10,
    cash: 5
  });

  if (!isOpen) return null;

  const total = Object.values(allocations).reduce((a: number, b: number) => a + b, 0);

  const handleSliderChange = (asset: keyof typeof allocations, value: number) => {
    setAllocations(prev => ({ ...prev, [asset]: value }));
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
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">Rebalance Portfolio</h2>
            <p className="text-sm text-slate-500">Adjust your target allocations</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl text-blue-800">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5" />
                <span className="font-medium">Total Allocation</span>
              </div>
              <span className={`font-bold ${total !== 100 ? 'text-red-500' : 'text-blue-700'}`}>
                {total}%
              </span>
            </div>

            <div className="space-y-6">
              {[
                { key: 'equities', label: 'Global Equities', color: 'bg-indigo-500' },
                { key: 'bonds', label: 'Fixed Income', color: 'bg-emerald-500' },
                { key: 'crypto', label: 'Digital Assets', color: 'bg-purple-500' },
                { key: 'cash', label: 'Cash Reserves', color: 'bg-slate-400' },
              ].map((asset) => (
                <div key={asset.key} className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                      <span className="text-slate-700">{asset.label}</span>
                    </div>
                    <span className="text-slate-900">{allocations[asset.key as keyof typeof allocations]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={allocations[asset.key as keyof typeof allocations]}
                    onChange={(e) => handleSliderChange(asset.key as keyof typeof allocations, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              ))}
            </div>

            {total !== 100 && (
              <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Allocations must add up to exactly 100%. Please adjust your sliders.</p>
              </div>
            )}

            <button 
              onClick={() => setStep(2)}
              disabled={total !== 100}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Review Proposed Trades <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 flex-1 flex flex-col space-y-6">
            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sliders className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900">Trade Summary</h3>
                <p className="text-slate-500 text-sm">Review the estimated trades to reach your new target allocation.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Sell: Fixed Income (US Treasury)</div>
                    <div className="text-xs text-slate-500">To match new 25% target</div>
                  </div>
                  <div className="text-red-600 font-bold text-sm">-$12,450.00</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Buy: Global Equities (VTI)</div>
                    <div className="text-xs text-slate-500">To match new 60% target</div>
                  </div>
                  <div className="text-green-600 font-bold text-sm">+$10,200.00</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Buy: Digital Assets (BTC)</div>
                    <div className="text-xs text-slate-500">To match new 10% target</div>
                  </div>
                  <div className="text-green-600 font-bold text-sm">+$2,250.00</div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-xs leading-relaxed">
                <span className="font-bold block mb-1">Tax Implications</span>
                Selling assets in a taxable account may trigger capital gains taxes. The estimated realized gain for this rebalance is $450.00.
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={onClose}
                className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Execute Trades
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
