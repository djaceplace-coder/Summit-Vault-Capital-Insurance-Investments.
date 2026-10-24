import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Search, Download, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export interface TxItem {
  id: string;
  type: string;
  amount: number;
  asset?: string;
  date: string;
  status: string;
  description: string;
}

const defaultSampleTransactions: TxItem[] = [
  { id: '1', type: 'deposit', amount: 5000, date: '2026-07-23', status: 'completed', description: 'Wire Transfer - Chase Bank' },
  { id: '2', type: 'buy', amount: 2450.50, asset: 'AAPL', date: '2026-07-22', status: 'completed', description: 'Bought 14 shares AAPL' },
  { id: '3', type: 'sell', amount: 1200, asset: 'BTC', date: '2026-07-20', status: 'completed', description: 'Sold 0.018 BTC' },
  { id: '4', type: 'fee', amount: 15, date: '2026-07-15', status: 'completed', description: 'Monthly Account Fee' },
  { id: '5', type: 'deposit', amount: 2000, date: '2026-07-10', status: 'completed', description: 'ACH Transfer - Wells Fargo' },
  { id: '6', type: 'buy', amount: 1800, asset: 'MSFT', date: '2026-07-08', status: 'completed', description: 'Bought 5 shares MSFT' },
  { id: '7', type: 'dividend', amount: 45.20, asset: 'VT', date: '2026-07-05', status: 'completed', description: 'Dividend Payment VT' },
  { id: '8', type: 'withdrawal', amount: 1000, date: '2026-07-01', status: 'completed', description: 'Wire Transfer to Chase Bank' },
];

export function Transactions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<TxItem[]>(defaultSampleTransactions);
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  useEffect(() => {
    if (!user) return;
    const txColRef = collection(db, 'users', user.uid, 'transactions');
    const unsub = onSnapshot(txColRef, (snapshot) => {
      if (!snapshot.empty) {
        const liveTxs: TxItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          liveTxs.push({
            id: d.id || docSnap.id,
            type: d.type || 'deposit',
            amount: Number(d.amount ?? 0),
            asset: d.assetName,
            date: d.timestamp ? d.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
            status: d.status || 'completed',
            description: d.assetName ? `${d.type.toUpperCase()}: ${d.assetName}` : `${d.type.toUpperCase()} Transfer`,
          });
        });
        // Combine live transactions on top of historical baseline
        setTransactions([...liveTxs, ...defaultSampleTransactions]);
      }
    }, (err) => {
      console.warn('Transactions snapshot warning:', err);
    });

    return () => unsub();
  }, [user]);

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-emerald-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'buy': return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'sell': return <RefreshCw className="w-5 h-5 text-amber-600" />;
      default: return <ArrowDownLeft className="w-5 h-5 text-slate-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-emerald-50';
      case 'withdrawal': return 'bg-red-50';
      case 'buy': return 'bg-blue-50';
      case 'sell': return 'bg-amber-50';
      default: return 'bg-slate-50';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'sell':
      case 'dividend':
        return 'text-emerald-600';
      case 'withdrawal':
      case 'buy':
      case 'fee':
        return 'text-slate-900';
      default: return 'text-slate-900';
    }
  };
  
  const formatAmount = (amount: number, type: string) => {
    const isPositive = ['deposit', 'sell', 'dividend'].includes(type);
    return `${isPositive ? '+' : '-'}$${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-2">Transactions Ledger</h1>
          <p className="text-slate-500">History of deposits, withdrawals, and asset trades in Firestore.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openAgentChat('I would like to export my transaction history as CSV.')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 space-y-4 sm:space-y-0 sm:flex items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['all', 'deposit', 'withdrawal', 'buy', 'sell'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  filter === f 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}s
              </button>
            ))}
            <button 
              onClick={() => openAgentChat('I need help applying advanced filters to my transactions.')}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors ml-2 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
            </button>
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
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 first:pl-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(tx.type)}`}>
                        {getIcon(tx.type)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 capitalize">{tx.type} {tx.asset && `- ${tx.asset}`}</div>
                        <div className="text-xs text-slate-500">{tx.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`p-4 text-right pr-6 font-bold ${getAmountColor(tx.type)}`}>
                    {formatAmount(tx.amount, tx.type)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-center">
          <button 
            onClick={() => openAgentChat('Can you fetch more historical transactions for me?')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Load More Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
