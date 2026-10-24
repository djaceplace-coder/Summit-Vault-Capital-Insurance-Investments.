import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Trophy, Globe, FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';

export function About() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-20 pb-16 lg:pt-24 lg:pb-20 px-5 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl leading-tight sm:text-5xl lg:text-7xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
        >
          30 years of building moats.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Summit Vault Capital was founded on a simple premise: your investments and your insurance shouldn't live in silos. We built a unified agency where protection and growth work together.
        </motion.p>
      </section>

      {/* Story / Timeline */}
      <section className="py-24 bg-slate-50">
        <div className="px-5 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          <div className="relative border-l-2 border-slate-200 pl-8 sm:ml-0 space-y-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-slate-900 ring-4 ring-slate-50" />
              <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">1996: The Agency Begins</h3>
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                Started in Nevada as a specialized life insurance agency, focusing on high-net-worth estate planning and corporate policies.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-slate-300 ring-4 ring-slate-50" />
              <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">2008: Expanding to Wealth</h3>
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                During the financial crisis, clients demanded a more holistic approach to downside protection. We acquired our broker-dealer licenses and launched our equities division.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-slate-300 ring-4 ring-slate-50" />
              <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">2021: Digital Assets & EU Expansion</h3>
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                Recognizing the shift in how wealth is created and stored, we integrated institutional-grade custody for digital assets and opened operations serving European clients.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-slate-900 ring-4 ring-slate-50 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">Today: The Modern Platform</h3>
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                We've digitized our entire 30-year infrastructure into a seamless app, while keeping the human advisors that built our reputation firmly in the loop.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Leadership</h2>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { name: "Michael Sterling", title: "Founder & CEO", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60" },
            { name: "Rachel Thorne", title: "Chief Investment Officer", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" },
            { name: "James Wei", title: "Head of Digital Assets", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=60" },
            { name: "Anita Patel", title: "Head of Insurance", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60" }
          ].map((leader, i) => (
            <div key={i} className="min-w-[200px] snap-center sm:min-w-0 text-center">
              <div className="rounded-full overflow-hidden aspect-square mb-4 mx-auto w-32 sm:w-48 shadow-sm">
                <img src={leader.img} alt={leader.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">{leader.name}</h3>
              <p className="text-slate-500 text-sm">{leader.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Licensing Stub */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="px-5 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
          <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold font-heading mb-6">Regulated & Licensed</h2>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed text-lg">
            Trust isn't just a marketing word for us. We operate under strict regulatory oversight in both the United States (FINRA/SIPC member brokerage) and the EU, holding active licenses across 28 regions for securities, life, and property insurance.
          </p>
          <div className="flex justify-center gap-4">
             <Link to="/legal/licensing" className="inline-flex items-center gap-2 font-semibold text-white hover:text-slate-300 transition-all">
                View Full Licensing Information <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
