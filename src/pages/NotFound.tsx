import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Home, Briefcase, ShieldCheck, Users, BookOpen } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export function NotFound() {
  const quickLinks = [
    { name: 'Products & Portfolios', href: '/products', icon: Briefcase, desc: 'Equities, digital assets & alternative strategies' },
    { name: 'Private Vault Insurance', href: '/insurance', icon: ShieldCheck, desc: 'Comprehensive high-limit asset protection' },
    { name: 'Accredited Agents', href: '/agents', icon: Users, desc: 'Consult licensed wealth fiduciaries' },
    { name: 'Financial Intelligence', href: '/learn', icon: BookOpen, desc: 'Institutional guides & wealth resources' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between pt-24 pb-16 px-5 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center my-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-8 shadow-xl shadow-amber-950/20"
        >
          <ShieldAlert className="w-10 h-10" />
        </motion.div>

        <span className="text-xs uppercase tracking-[0.28em] font-semibold text-amber-400 mb-3">
          Error 404 · Unallocated Vault Sector
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-white tracking-tight mb-4">
          Requested Record Not Found
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          The depository route or vault ledger record you attempted to reach has moved or does not exist. Please navigate to an authorized department below.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-14">
          <Link
            to="/"
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Depository Home
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-7 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Client Access Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Directory of verified institutional destinations */}
        <div className="w-full text-left">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4 text-center">
            Authorized Depository Sectors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {quickLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 pt-8 border-t border-slate-900">
        Summit Vault Capital · Segregated Custody Architecture · All Rights Reserved
      </div>
    </div>
  );
}
