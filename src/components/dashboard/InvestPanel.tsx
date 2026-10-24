import { useState } from 'react';
import { ASSETS, Asset } from '../../data/assets';
import { Search, CheckCircle2, ArrowRight, AlertCircle, Wallet } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export function InvestPanel({
  onInvestSuccess,
  onRequestDeposit,
}: {
  onInvestSuccess?: () => void;
  onRequestDeposit?: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const { user, profile, updateUserBalance } = useAuth();

  const availableCash = Number(profile?.cashBalance ?? 0);
  const currentInvested = Number(profile?.investedAmount ?? 0);
  const currentTotal = Number(profile?.totalBalance ?? 0);

  const featuredAssets = ASSETS.slice(0, 6);
  const filteredAssets = searchTerm.trim()
    ? ASSETS.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.assetClass.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6)
    : featuredAssets;

  const handleInvest = async () => {
    if (!selectedAsset || !amount || isNaN(Number(amount))) return;
    const investAmount = Number(amount);
    if (investAmount <= 0) {
      setError('Please enter a valid investment amount.');
      return;
    }
    if (investAmount > availableCash) {
      setError(
        `Insufficient available cash ($${availableCash.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })}). Please fund your account first or enter an amount within your available cash.`
      );
      return;
    }

    setError('');
    setStatus('processing');

    try {
      if (user) {
        const txId = 'tx_' + Date.now();
        const txDocRef = doc(db, 'users', user.uid, 'transactions', txId);
        await setDoc(txDocRef, {
          id: txId,
          userId: user.uid,
          type: 'buy',
          amount: investAmount,
          assetName: `${selectedAsset.name} (${selectedAsset.symbol})`,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });

        await updateUserBalance({
          cashBalance: Math.max(0, availableCash - investAmount),
          investedAmount: currentInvested + investAmount,
          totalBalance: Math.max(currentTotal, availableCash - investAmount + currentInvested + investAmount),
        });
      }

      setStatus('success');
      if (onInvestSuccess) onInvestSuccess();

      setTimeout(() => {
        setStatus('idle');
        setSelectedAsset(null);
        setAmount('');
        setSearchTerm('');
      }, 2200);
    } catch (e) {
      console.error('Error executing investment:', e);
      setError('Failed to execute investment order. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-900">Allocate & Invest Capital</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Deploy available cash across equities, fixed income, and digital vault assets.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 self-start sm:self-auto tabular-nums">
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            Available Cash: <span className="font-bold text-slate-900">${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {status === 'success' ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Order Executed</h4>
            <p className="text-slate-500 text-sm mt-1">
              Allocated <span className="font-bold text-slate-900 tabular-nums">${Number(amount).toLocaleString()}</span> into {selectedAsset?.name} ({selectedAsset?.symbol}).
            </p>
          </div>
        ) : status === 'processing' ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <div className="w-7 h-7 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Executing Institutional Order</h4>
            <p className="text-slate-500 text-xs mt-1">Settling allocation and updating your portfolio ledger...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {!selectedAsset ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Select Instrument ({ASSETS.length}+ Available)
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ticker or asset name (e.g. AAPL, NVDA, BTC, VTI)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setError('');
                      }}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50/80 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-900 text-sm">{asset.symbol}</div>
                        <div className="text-xs text-slate-500 truncate">{asset.name}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                          ${asset.price.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">{asset.assetClass}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-bold text-xs">
                    {selectedAsset.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedAsset.name} ({selectedAsset.symbol})
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      Spot Price: ${selectedAsset.price.toLocaleString()} · {selectedAsset.assetClass}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                >
                  Change Asset
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Allocation Amount (USD)
                </label>
                {availableCash > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAmount(String(availableCash));
                      setError('');
                    }}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer tabular-nums"
                  >
                    Use Max Cash (${availableCash.toLocaleString()})
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {onRequestDeposit && (
                  <button
                    type="button"
                    onClick={onRequestDeposit}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Fund Account
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleInvest}
              disabled={!selectedAsset || !amount || Number(amount) <= 0}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              Execute Allocation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
