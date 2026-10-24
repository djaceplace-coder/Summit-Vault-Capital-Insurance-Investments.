import { AnimatePresence } from 'motion/react';
import {
  PieChart as PieChartIcon, TrendingUp, RefreshCw, Download, Plus, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { RebalanceModal } from '../../components/dashboard/RebalanceModal';
import { DepositModal } from '../../components/dashboard/DepositModal';

interface HoldingItem {
  symbol: string;
  name: string;
  value: number;
  allocation: number;
  change: string;
  isPositive: boolean;
}

export function Portfolio() {
  const { user, profile, updateUserBalance } = useAuth();
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  const totalBalance = Number(profile?.totalBalance ?? 0);
  const investedAmount = Number(profile?.investedAmount ?? 0);
  const cashBalance = Number(profile?.cashBalance ?? 0);
  const returnsAmount = Number(profile?.returnsAmount ?? 0);

  const [timeframe, setTimeframe] = useState('1M');
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [txHoldings, setTxHoldings] = useState<Record<string, { name: string; value: number }>>({});
  const [liquidatingSymbol, setLiquidatingSymbol] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'transactions'),
      (snap) => {
        const map: Record<string, { name: string; value: number }> = {};
        snap.forEach((d) => {
          const data = d.data();
          if (data.type === 'buy' && data.assetName) {
            const match = String(data.assetName).match(/^(.*)\s+\(([^)]+)\)$/);
            const sym = match ? match[2] : String(data.assetName).slice(0, 5).toUpperCase();
            const name = match ? match[1] : String(data.assetName);
            if (!map[sym]) map[sym] = { name, value: 0 };
            map[sym].value += Number(data.amount ?? 0);
          } else if (data.type === 'sell' && data.assetName) {
            const match = String(data.assetName).match(/^(.*)\s+\(([^)]+)\)$/);
            const sym = match ? match[2] : String(data.assetName).slice(0, 5).toUpperCase();
            if (map[sym]) {
              map[sym].value = Math.max(0, map[sym].value - Number(data.amount ?? 0));
            }
          }
        });
        setTxHoldings(map);
      },
      () => {}
    );
    return () => unsub();
  }, [user]);

  // Build holdings list from actual buy transactions OR proportional institutional allocation if Admin set investedAmount > 0
  const holdings: HoldingItem[] = (() => {
    const entries = (Object.entries(txHoldings) as [string, { name: string; value: number }][]).filter(
      ([, v]) => v.value > 0
    );
    if (entries.length > 0) {
      const sum = entries.reduce((acc, [, v]) => acc + v.value, 0) || 1;
      return entries.map(([symbol, item]) => ({
        symbol,
        name: item.name,
        value: item.value,
        allocation: Number(((item.value / sum) * 100).toFixed(1)),
        change: '+2.4%',
        isPositive: true,
      }));
    }
    if (investedAmount > 0) {
      return [
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', value: Math.round(investedAmount * 0.45), allocation: 45, change: '+2.1%', isPositive: true },
        { symbol: 'AAPL', name: 'Apple Inc.', value: Math.round(investedAmount * 0.25), allocation: 25, change: '+1.8%', isPositive: true },
        { symbol: 'MSFT', name: 'Microsoft Corp.', value: Math.round(investedAmount * 0.2), allocation: 20, change: '+1.5%', isPositive: true },
        { symbol: 'BTC', name: 'Bitcoin Institutional Custody', value: Math.round(investedAmount * 0.1), allocation: 10, change: '+4.2%', isPositive: true },
      ];
    }
    return [];
  })();

  const handleLiquidateHolding = async (holding: HoldingItem) => {
    if (!user || holding.value <= 0) return;
    setLiquidatingSymbol(holding.symbol);
    try {
      const txId = `tx_${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'transactions', txId), {
        id: txId,
        userId: user.uid,
        type: 'sell',
        amount: holding.value,
        assetName: `${holding.name} (${holding.symbol})`,
        status: 'completed',
        timestamp: new Date().toISOString(),
      });

      await updateUserBalance({
        investedAmount: Math.max(0, investedAmount - holding.value),
        cashBalance: cashBalance + holding.value,
        totalBalance: totalBalance,
      });
    } catch (e) {
      console.error('Error liquidating position:', e);
    } finally {
      setLiquidatingSymbol(null);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Symbol', 'Asset Name', 'Value (USD)', 'Allocation (%)', '24h Change'],
      ...holdings.map((h) => [h.symbol, `"${h.name}"`, h.value.toFixed(2), String(h.allocation), h.change]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'summit-vault-portfolio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData =
    totalBalance > 0
      ? [
          { name: 'Jan', value: Math.round(totalBalance * 0.82) },
          { name: 'Feb', value: Math.round(totalBalance * 0.85) },
          { name: 'Mar', value: Math.round(totalBalance * 0.88) },
          { name: 'Apr', value: Math.round(totalBalance * 0.91) },
          { name: 'May', value: Math.round(totalBalance * 0.95) },
          { name: 'Jun', value: Math.round(totalBalance * 0.98) },
          { name: 'Now', value: totalBalance },
        ]
      : [
          { name: 'Jan', value: 0 },
          { name: 'Feb', value: 0 },
          { name: 'Mar', value: 0 },
          { name: 'Apr', value: 0 },
          { name: 'May', value: 0 },
          { name: 'Now', value: 0 },
        ];

  const eqPct = totalBalance > 0 ? Math.round((investedAmount / totalBalance) * 100) : 0;
  const cashPct = totalBalance > 0 ? Math.max(0, 100 - eqPct) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1">Portfolio Management</h1>
          <p className="text-slate-500 text-sm">Track and manage your active institutional allocations and cash reserves.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowRebalanceModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Rebalance
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Fund Account
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Vault Value</div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono tabular-nums">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 tabular-nums">
                <span className="inline-flex items-center font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +${returnsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total Returns
                </span>
                <span>·</span>
                <span>Invested: ${investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span>·</span>
                <span>Cash: ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    timeframe === t ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-6">Capital Structure</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 tabular-nums">
                  <span className="text-slate-600">Allocated Investments</span>
                  <span className="text-slate-900">
                    ${investedAmount.toLocaleString()} ({eqPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-slate-900 h-2.5 rounded-full transition-all" style={{ width: `${eqPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 tabular-nums">
                  <span className="text-slate-600">Available Cash Reserves</span>
                  <span className="text-slate-900">
                    ${cashBalance.toLocaleString()} ({cashPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: `${cashPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 tabular-nums">
                  <span className="text-slate-600">Accumulated Net Yield</span>
                  <span className="text-emerald-600">+${returnsAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${totalBalance > 0 ? Math.min(100, Math.round((returnsAmount / totalBalance) * 100)) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => setShowRebalanceModal(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Adjust Target Allocation
            </button>
            <button
              onClick={() => openAgentChat('Can you provide a fiduciary review of my current portfolio allocation?')}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
            >
              <PieChartIcon className="w-4 h-4" /> Request Advisor Portfolio Audit
            </button>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900">Active Holdings</h3>
            <p className="text-xs text-slate-500">Live custody positions synchronized with your vault ledger</p>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-600 font-semibold text-sm mb-1">No Active Holdings ($0.00 Invested)</p>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-5">
              Fund your account and allocate capital from the Dashboard to build your institutional portfolio.
            </p>
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Fund Vault Account
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold first:pl-6">Instrument</th>
                  <th className="p-4 font-semibold">Market Value</th>
                  <th className="p-4 font-semibold">Weight</th>
                  <th className="p-4 font-semibold">24h Return</th>
                  <th className="p-4 font-semibold text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 first:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {holding.symbol.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{holding.symbol}</div>
                          <div className="text-xs text-slate-500">{holding.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 font-mono tabular-nums">
                      ${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 hidden sm:block">
                          <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${Math.min(100, holding.allocation)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">{holding.allocation}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 font-mono tabular-nums">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {holding.change}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleLiquidateHolding(holding)}
                        disabled={liquidatingSymbol === holding.symbol}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {liquidatingSymbol === holding.symbol ? 'Selling...' : 'Sell to Cash'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRebalanceModal && <RebalanceModal isOpen={showRebalanceModal} onClose={() => setShowRebalanceModal(false)} />}
        {showDepositModal && <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
