import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS, Asset } from '../../data/assets';
import { Search, ChevronDown, CheckCircle2, ArrowRight, Activity, DollarSign, Box, ShieldCheck, Database } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export function InvestPanel({ onInvestSuccess }: { onInvestSuccess?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  
  const { user, profile, updateUserBalance } = useAuth();

  const filteredAssets = ASSETS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleInvest = async () => {
    if (!selectedAsset || !amount || isNaN(Number(amount))) return;
    setStatus('processing');
    
    try {
      const investAmount = Number(amount);
      const currentCash = profile?.cashBalance ?? 50000;
      const currentInvested = profile?.investedAmount ?? 95000;
      const currentTotal = profile?.totalBalance ?? 145000;

      if (user) {
        // Record transaction in Firestore
        const txId = 'tx_' + Date.now();
        const txDocRef = doc(db, 'users', user.uid, 'transactions', txId);
        await setDoc(txDocRef, {
          id: txId,
          userId: user.uid,
          type: 'buy',
          amount: investAmount,
          assetName: `${selectedAsset.name} (${selectedAsset.symbol})`,
          status: 'completed',
          timestamp: new Date().toISOString()
        });

        // Update balances in Firestore
        await updateUserBalance({
          cashBalance: Math.max(0, currentCash - investAmount),
          investedAmount: currentInvested + investAmount,
          totalBalance: currentTotal,
        });
      }

      setStatus('success');
      if (onInvestSuccess) onInvestSuccess();
      
      setTimeout(() => {
        setStatus('idle');
        setSelectedAsset(null);
        setAmount('');
        setSearchTerm('');
      }, 2500);
    } catch (e) {
      console.error('Error executing investment:', e);
      setStatus('idle');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">Sync & Invest</h3>
        <p className="text-slate-500 text-sm mb-6">Allocate your cash balance across our 30+ algorithmic assets.</p>

        {status === 'success' ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Investment Executed</h4>
            <p className="text-slate-500 text-sm mt-1">Your allocation to {selectedAsset?.symbol} has been securely processed by our algorithmic engine.</p>
          </div>
        ) : status === 'processing' ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Executing Order</h4>
            <p className="text-slate-500 text-sm mt-1">Running algorithmic routing and settling via secure exchange node...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {!selectedAsset ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Asset</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by symbol or name (e.g. AAPL, BTC)"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:bg-white transition-all"
                  />
                </div>
                {searchTerm && (
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm max-h-48 overflow-y-auto">
                    {filteredAssets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{asset.symbol}</div>
                          <div className="text-xs text-slate-500">{asset.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">${asset.price.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{asset.assetClass}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-100">
                    {selectedAsset.symbol.substring(0,2)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{selectedAsset.symbol}</div>
                    <div className="text-xs text-slate-500">{selectedAsset.name}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedAsset(null)} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                  Change
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Investment Amount (USD)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</div>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
            </div>

            <button 
              onClick={handleInvest}
              disabled={!selectedAsset || !amount || Number(amount) <= 0}
              className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              Execute Investment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
