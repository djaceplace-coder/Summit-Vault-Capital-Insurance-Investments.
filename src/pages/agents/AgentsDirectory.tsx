import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const agentsData = [
  { id: '1', name: "Sarah Jenkins", role: "Equities & Wealth Specialist", exp: "12 yrs exp", location: "Las Vegas, NV", lang: "English", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" },
  { id: '2', name: "David Chen", role: "Digital Assets Lead", exp: "8 yrs exp", location: "Reno, NV", lang: "English, Mandarin", img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&auto=format&fit=crop&q=60" },
  { id: '3', name: "Elena Rodriguez", role: "Insurance & Estate Planning", exp: "15 yrs exp", location: "Miami, FL", lang: "English, Spanish", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60" },
  { id: '4', name: "Marcus Johnson", role: "Alternative Assets", exp: "10 yrs exp", location: "New York, NY", lang: "English", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60" },
  { id: '5', name: "Priya Patel", role: "Managed Portfolios", exp: "7 yrs exp", location: "Chicago, IL", lang: "English, Hindi", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=60" },
  { id: '6', name: "Michael Chang", role: "Property & Casualty", exp: "20 yrs exp", location: "San Francisco, CA", lang: "English", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60" },
];

export function AgentsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Wealth', 'Insurance', 'Crypto', 'Alternative'];

  const filteredAgents = agentsData.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          agent.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Wealth') return matchesSearch && agent.role.includes('Wealth') || agent.role.includes('Managed');
    if (activeFilter === 'Insurance') return matchesSearch && agent.role.includes('Insurance') || agent.role.includes('Property');
    if (activeFilter === 'Crypto') return matchesSearch && agent.role.includes('Digital');
    if (activeFilter === 'Alternative') return matchesSearch && agent.role.includes('Alternative');
    
    return matchesSearch;
  });

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-20 pb-12 lg:pt-24 lg:pb-16 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl leading-tight sm:text-5xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
        >
          Real people. Real expertise.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Find an accredited advisor matched to your specific financial goals and language preferences.
        </motion.p>
      </section>

      {/* Search & Filter Bar */}
      <section className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-slate-300 rounded-2xl outline-none transition-all shadow-inner"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar -mx-1 px-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === f 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
            <button className="px-5 py-2.5 rounded-2xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4" /> More
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredAgents.map((agent, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={agent.id} 
              className="group relative rounded-[2rem] overflow-hidden aspect-[3/4] bg-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all"
            >
              <img src={agent.img} alt={agent.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex justify-between items-end mb-3">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold tracking-wide">
                    {agent.exp}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {agent.location}
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-1 tracking-tight">{agent.name}</h3>
                <p className="text-slate-300 text-sm mb-6">{agent.role}</p>
                <Link to={`/agents/${agent.id}`} className="flex items-center justify-between bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm">
                  <span>View Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredAgents.length === 0 && (
          <div className="text-center py-24 text-slate-500">
            No agents found matching your criteria.
          </div>
        )}
      </section>
      
      {/* CTA Join */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">Are you a licensed professional?</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Join our growing network of accredited agents and bring a modern wealth platform to your clients.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link to="/agents/apply" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
              Apply to become an agent <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="hidden sm:block w-px h-6 bg-slate-300" />
            <Link to="/agents/login" className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Agent Portal Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
