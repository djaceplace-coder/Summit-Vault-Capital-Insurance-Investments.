import { motion } from 'motion/react';
import { Users, FileText, ArrowUpRight, TrendingUp, DollarSign, Calendar, MessageSquare, MoreVertical, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function AgentPortal() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: "Active Clients", value: "124", trend: "+12", icon: <Users className="w-5 h-5" /> },
    { label: "AUM (Assets Under Management)", value: "$18.4M", trend: "+$2.1M", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Pending Policies", value: "14", trend: "-3", icon: <FileText className="w-5 h-5" /> },
    { label: "Monthly Commissions", value: "$24,500", trend: "+$1,200", icon: <DollarSign className="w-5 h-5" /> },
  ];

  const clients = [
    { id: 1, name: "Eleanor Pena", type: "High Net Worth", aum: "$2.4M", status: "Active", lastContact: "2 days ago" },
    { id: 2, name: "Robert Fox", type: "Corporate", aum: "$5.1M", status: "Onboarding", lastContact: "Today" },
    { id: 3, name: "Jane Cooper", type: "Retail", aum: "$450k", status: "Active", lastContact: "1 week ago" },
    { id: 4, name: "Wade Warren", type: "High Net Worth", aum: "$1.8M", status: "Review Needed", lastContact: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Agent Portal</span>
              <span className="text-slate-500 text-sm font-medium">Summit Vault Capital</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">Welcome back, Sarah.</h1>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Add Client
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-slate-200 pb-px">
          {['overview', 'clients', 'policies', 'commissions', 'leads'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap capitalize transition-colors ${
                activeTab === tab 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold font-heading text-slate-900">{stat.value}</div>
                    <div className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Client List */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold font-heading text-slate-900">Recent Clients</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search clients..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:w-64"
                      />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                        <th className="font-medium p-4 pl-6">Client Name</th>
                        <th className="font-medium p-4">Type</th>
                        <th className="font-medium p-4">AUM</th>
                        <th className="font-medium p-4">Status</th>
                        <th className="font-medium p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 pl-6 font-medium text-slate-900">{client.name}</td>
                          <td className="p-4 text-slate-500 text-sm">{client.type}</td>
                          <td className="p-4 text-slate-900 font-medium">{client.aum}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                              client.status === 'Active' ? 'bg-green-50 text-green-700' :
                              client.status === 'Onboarding' ? 'bg-blue-50 text-blue-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-slate-100 text-center mt-auto">
                  <button className="text-slate-600 text-sm font-medium hover:text-slate-900 flex items-center justify-center gap-1 mx-auto w-full">
                    View All Clients <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold font-heading text-slate-900 mb-6">Action Items</h2>
                <div className="space-y-4">
                  {[
                    { title: "Review life policy for W. Warren", time: "Due Today", type: "urgent" },
                    { title: "Quarterly review with E. Pena", time: "Tomorrow at 10 AM", type: "meeting" },
                    { title: "Approve KYC documents for R. Fox", time: "Pending", type: "task" },
                    { title: "Follow up on generic lead: 'Tech Exec'", time: "Overdue", type: "urgent" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                        item.type === 'urgent' ? 'bg-red-500' : 
                        item.type === 'meeting' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="font-medium text-slate-900 text-sm mb-1">{item.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {item.type === 'meeting' ? <Calendar className="w-3 h-3" /> : null}
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Empty State */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-24 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 capitalize">{activeTab} Dashboard</h3>
            <p className="text-slate-500 max-w-md mx-auto">This section of the agent portal is being provisioned. Client and product data will sync shortly.</p>
          </div>
        )}

      </div>
    </div>
  );
}
