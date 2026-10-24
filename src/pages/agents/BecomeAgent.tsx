import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, Users, ArrowRight } from 'lucide-react';

export function BecomeAgent() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-6"
        >
          Join an agency built to last.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
        >
          Bring a modern, unified wealth and protection platform to your clients, backed by 30 years of industry experience.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block">
            Start Application
          </button>
        </motion.div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">All Asset Classes</h3>
              <p className="text-slate-600">Don't lose clients because you can't offer crypto or alternative assets. Our platform gives you access to everything.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Higher Payouts</h3>
              <p className="text-slate-600">Because our technology handles the heavy lifting of compliance and reporting, we pass more of the revenue split to you.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modern Client UX</h3>
              <p className="text-slate-600">Give your clients an app they actually want to log into. A seamless dashboard for their portfolio, policies, and documents.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Requirements */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-12">What we look for</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-left">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Active Licenses</h4>
            <p className="text-slate-600 text-sm">Must hold valid FINRA Series 7/66 or state Life & Health licenses.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Clean Record</h4>
            <p className="text-slate-600 text-sm">A clean U4 and no pending regulatory actions or customer disputes.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Experience</h4>
            <p className="text-slate-600 text-sm">Minimum 3 years of client-facing advisory or insurance sales experience.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">Fiduciary Mindset</h4>
            <p className="text-slate-600 text-sm">A commitment to putting the client's long-term financial health first.</p>
          </div>
        </div>
        
        <div className="mt-16">
          <button className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block">
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
}
