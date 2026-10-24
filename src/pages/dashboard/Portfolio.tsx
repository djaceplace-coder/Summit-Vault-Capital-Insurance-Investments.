import { motion } from 'motion/react';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, RefreshCw, Download, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

const mockChartData = [
  { name: 'Jan', value: 120000 },
  { name: 'Feb', value: 125000 },
  { name: 'Mar', value: 123000 },
  { name: 'Apr', value: 130000 },
  { name: 'May', value: 134000 },
  { name: 'Jun', value: 142000 },
  { name: 'Jul', value: 145000 },
];

const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', value: 45000, allocation: 31, change: '+2.4%', isPositive: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', value: 38000, allocation: 26, change: '+1.8%', isPositive: true },
  { symbol: 'VT', name: 'Vanguard Total World Stock', value: 30000, allocation: 20.7, change: '-0.5%', isPositive: false },
  { symbol: 'BTC', name: 'Bitcoin', value: 15000, allocation: 10.3, change: '+5.2%', isPositive: true },
  { symbol: 'USDC', name: 'USD Coin', value: 17000, allocation: 12, change: '0.0%', isPositive: true },
];

export function Portfolio() {
  const { user, profile } = useAuth();
  const userBalance = {
    total_balance: profile?.totalBalance ?? 145000,
    invested_amount: profile?.investedAmount ?? 95000,
    cash_balance: profile?.cashBalance ?? 50000,
    returns_amount: profile?.returnsAmount ?? 14200
  };

  const [timeframe, setTimeframe] = useState('1M');
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-2">Portfolio Management</h1>
          <p className="text-slate-500">Track and manage your investment allocations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openAgentChat('I would like to export my portfolio data.')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => openAgentChat('I need help rebalancing my portfolio.')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Rebalance
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1">Total Value</div>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900">${userBalance.total_balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  <TrendingUp className="w-4 h-4 mr-1" /> +$25,000.00 (20.8%)
                </span>
                <span className="text-slate-400 text-sm">All time</span>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeframe === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide={true} domain={['dataMin - 10000', 'dataMax + 10000']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-6">Asset Allocation</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Equities</span>
                <span className="font-bold text-slate-900">60%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Fixed Income</span>
                <span className="font-bold text-slate-900">25%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Digital Assets</span>
                <span className="font-bold text-slate-900">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Cash & Equivalents</span>
                <span className="font-bold text-slate-900">5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-800 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={() => openAgentChat('Can you provide a detailed analysis of my asset allocation?')}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
            >
              <PieChartIcon className="w-4 h-4" /> View Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold font-heading text-slate-900">Current Holdings</h3>
          <button 
            onClick={() => openAgentChat('I would like to filter my current holdings.')}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium first:pl-6">Asset</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium">Allocation</th>
                <th className="p-4 font-medium text-right pr-6">24h Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 first:pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {holding.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{holding.symbol}</div>
                        <div className="text-sm text-slate-500">{holding.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    ${holding.value.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 hidden sm:block">
                        <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: `${holding.allocation}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{holding.allocation}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className={`inline-flex items-center gap-1 text-sm font-medium ${holding.isPositive ? 'text-green-600' : (holding.change === '0.0%' ? 'text-slate-500' : 'text-red-500')}`}>
                      {holding.isPositive && <TrendingUp className="w-3 h-3" />}
                      {!holding.isPositive && holding.change !== '0.0%' && <TrendingDown className="w-3 h-3" />}
                      {holding.change}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
