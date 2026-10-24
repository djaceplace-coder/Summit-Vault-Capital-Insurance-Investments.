import { motion } from 'motion/react';
import { Search, Filter, Shield, MoreVertical, LogIn, Edit, UserX } from 'lucide-react';
import { useState } from 'react';

export function AdminAgents() {
  const agents = [
    { id: 'AG-001', name: 'Sarah Jenkins', email: 's.jenkins@summitvaultcapital.online', status: 'Active', aum: '$45.2M', clients: 124 },
    { id: 'AG-002', name: 'David Chen', email: 'd.chen@summitvaultcapital.online', status: 'Active', aum: '$32.1M', clients: 89 },
    { id: 'AG-003', name: 'Elena Rodriguez', email: 'e.rodriguez@summitvaultcapital.online', status: 'Active', aum: '$68.5M', clients: 156 },
    { id: 'AG-004', name: 'Michael Chang', email: 'm.chang@summitvaultcapital.online', status: 'Suspended', aum: '$12.0M', clients: 42 },
    { id: 'AG-005', name: 'Priya Patel', email: 'p.patel@summitvaultcapital.online', status: 'Pending', aum: '$0', clients: 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 text-slate-300">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                Admin Settings
              </span>
            </div>
            <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Manage Agents</h1>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-100 transition-colors shadow-sm">
              Provision New Agent
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search agents by name or ID..." 
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-slate-700 w-full sm:w-80 text-white"
              />
            </div>
            <button className="p-2 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-500 text-sm border-b border-slate-800">
                  <th className="font-medium p-4 pl-6">Agent Info</th>
                  <th className="font-medium p-4">ID</th>
                  <th className="font-medium p-4">Status</th>
                  <th className="font-medium p-4">Total AUM</th>
                  <th className="font-medium p-4">Clients</th>
                  <th className="font-medium p-4 pr-6 text-right">Impersonate / Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-medium text-white">{agent.name}</div>
                      <div className="text-sm text-slate-500">{agent.email}</div>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-400">{agent.id}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        agent.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        agent.status === 'Pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white">{agent.aum}</td>
                    <td className="p-4 text-slate-400">{agent.clients}</td>
                    <td className="p-4 pr-6 text-right space-x-2 flex justify-end">
                      {agent.status === 'Active' && (
                        <button className="flex items-center gap-1.5 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors">
                          <LogIn className="w-3.5 h-3.5" /> View As
                        </button>
                      )}
                      <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                        <UserX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
