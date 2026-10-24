import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, ArrowUpRight, TrendingUp, DollarSign, Calendar, MessageSquare, MoreVertical, Search, Filter, AlertTriangle, Shield, Settings, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('global');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState('');

  const handlePurgeAllAccounts = async () => {
    if (!window.confirm('Are you sure you want to purge all accounts in the database? This cannot be undone.')) {
      return;
    }
    setIsPurging(true);
    setPurgeMessage('');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const d of usersSnap.docs) {
        await deleteDoc(doc(db, 'users', d.id));
      }
      const adminsSnap = await getDocs(collection(db, 'admins'));
      for (const d of adminsSnap.docs) {
        await deleteDoc(doc(db, 'admins', d.id));
      }
      setPurgeMessage(`Successfully purged ${usersSnap.size} accounts from Firestore.`);
    } catch (e: any) {
      console.error('Error purging accounts:', e);
      setPurgeMessage('Purge failed: ' + (e.message || String(e)));
    } finally {
      setIsPurging(false);
      setTimeout(() => setPurgeMessage(''), 5000);
    }
  };

  const stats = [
    { label: "Total AUM", value: "$4.2B", trend: "+$120M", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Active Clients", value: "14,205", trend: "+342", icon: <Users className="w-5 h-5" /> },
    { label: "Active Agents", value: "312", trend: "+5", icon: <Shield className="w-5 h-5" /> },
    { label: "Flagged Txns", value: "24", trend: "-2", icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> },
  ];

  const flaggedTransactions = [
    { id: 'TX-9021', client: 'Elena Rostova', agent: 'David Chen', type: 'Large Withdrawal', amount: '$450,000', status: 'Pending Review', date: '10 mins ago' },
    { id: 'TX-9022', client: 'Marcus Sterling', agent: 'Sarah Jenkins', type: 'Unusual Trade', amount: '$1.2M', status: 'Pending Review', date: '1 hr ago' },
    { id: 'TX-9023', client: 'TechCorp Trust', agent: 'Elena Rodriguez', type: 'KYC Expired', amount: 'N/A', status: 'Action Req', date: '3 hrs ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 text-slate-300">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-8">
        
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Master Admin
              </span>
              <span className="text-slate-500 text-sm">Summit Vault Capital Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">Global Command Center</h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/balances" className="bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Client Balances
            </Link>
            <Link to="/admin/agents" className="bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-400" /> Manage Agents
            </Link>
            <button 
              onClick={handlePurgeAllAccounts} 
              disabled={isPurging}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl font-medium hover:bg-red-500/20 transition-colors shadow-sm flex items-center gap-2 text-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> {isPurging ? 'Purging...' : 'Purge All Accounts'}
            </button>
          </div>
        </div>

        {purgeMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{purgeMessage}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-white mb-4 relative z-10">
                {stat.icon}
              </div>
              <div className="text-slate-500 text-sm font-medium mb-1 relative z-10">{stat.label}</div>
              <div className="flex items-end justify-between relative z-10">
                <div className="text-3xl font-bold font-heading text-white">{stat.value}</div>
                <div className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-8">
             {/* Platform Health */}
             <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold font-heading text-white">Platform Health & Metrics</h2>
                  <select className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-700">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Year to Date</option>
                  </select>
                </div>
                <div className="h-64 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center bg-slate-950/50">
                   <div className="text-center">
                     <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                     <p className="text-slate-500 font-medium">AUM Growth Chart Visualization</p>
                   </div>
                </div>
             </div>

             {/* Recent Flagged */}
             <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Action Required (Flagged)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/50 text-slate-500 text-sm border-b border-slate-800">
                        <th className="font-medium p-4 pl-6">ID / Type</th>
                        <th className="font-medium p-4">Client / Agent</th>
                        <th className="font-medium p-4">Amount</th>
                        <th className="font-medium p-4">Status</th>
                        <th className="font-medium p-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flaggedTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group">
                          <td className="p-4 pl-6">
                            <div className="font-medium text-white text-sm">{tx.type}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{tx.id}</div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="text-slate-300">{tx.client}</div>
                            <div className="text-xs text-slate-500">via {tx.agent}</div>
                          </td>
                          <td className="p-4 text-white font-medium text-sm">{tx.amount}</td>
                          <td className="p-4">
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button 
                              onClick={() => { setSelectedTx(tx); setShowTransactionModal(true); }}
                              className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
             {/* Quick Agent Access */}
             <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold font-heading text-white">Agent Directory</h2>
                  <Link to="/admin/agents" className="text-sm text-slate-400 hover:text-white transition-colors">View All</Link>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold font-heading text-white">User Balances</h2>
                  <Link to="/admin/balances" className="text-sm text-slate-400 hover:text-white transition-colors">Manage Balances</Link>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search agents to impersonate..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-slate-700 text-white placeholder-slate-600"
                  />
                </div>
                <div className="space-y-3">
                  {['Sarah Jenkins', 'David Chen', 'Elena Rodriguez'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{name}</div>
                          <div className="text-xs text-slate-500">Active</div>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800">
                        View As
                      </button>
                    </div>
                  ))}
                </div>
             </div>

             {/* System Alerts */}
             <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm p-6">
               <h2 className="text-lg font-bold font-heading text-white mb-6">System Log</h2>
               <div className="space-y-4">
                  <div className="flex gap-3 text-sm">
                    <div className="mt-0.5 text-slate-500 text-xs font-mono">10:42</div>
                    <div>
                      <span className="text-white">API Sync Completed.</span>
                      <p className="text-slate-500 text-xs mt-0.5">Market data feeds synchronized successfully.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="mt-0.5 text-slate-500 text-xs font-mono">09:15</div>
                    <div>
                      <span className="text-white">New Agent Application</span>
                      <p className="text-slate-500 text-xs mt-0.5">Pending approval from admin.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="mt-0.5 text-slate-500 text-xs font-mono">08:00</div>
                    <div>
                      <span className="text-red-400">Failed KYC Check</span>
                      <p className="text-slate-500 text-xs mt-0.5">System flagged multiple ID mismatches.</p>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction Slide-over Modal */}
      <AnimatePresence>
        {showTransactionModal && selectedTx && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTransactionModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">Review Transaction</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">{selectedTx.id}</p>
                </div>
                <button 
                  onClick={() => setShowTransactionModal(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction Type</label>
                    <div className="text-white font-medium mt-1">{selectedTx.type}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</label>
                    <div className="text-2xl font-bold text-white mt-1">{selectedTx.amount}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Client</label>
                      <div className="text-white font-medium mt-1">{selectedTx.client}</div>
                      <Link to="#" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">View Profile</Link>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Agent</label>
                      <div className="text-white font-medium mt-1">{selectedTx.agent}</div>
                      <Link to="#" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">View Dashboard</Link>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-500">System Flag Triggered</h4>
                        <p className="text-sm text-slate-300 mt-1">Transaction exceeds 25% of client's total liquid portfolio. Manual override required by Master Admin.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Admin Notes (Internal)</label>
                    <textarea 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-slate-600 min-h-[100px]"
                      placeholder="Add notes regarding this override..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
                <button className="flex-1 bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button className="flex-1 bg-white text-slate-900 font-medium py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Approve Override
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
