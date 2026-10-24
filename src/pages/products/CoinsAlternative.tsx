import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins as CoinsIcon, Diamond, Building, Paintbrush, FileHeart, ArrowRight, ArrowLeft } from 'lucide-react';

export function CoinsAlternative() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { id: 'coins', title: 'Rare Coins', icon: CoinsIcon, desc: 'Graded numismatic coins with historical significance and proven scarcity.' },
    { id: 'art', title: 'Fine Art', icon: Paintbrush, desc: 'Fractional or whole ownership of blue-chip contemporary and modern art.' },
    { id: 'realestate', title: 'Real Estate', icon: Building, desc: 'Direct investments in commercial and high-yield residential properties.' },
    { id: 'collectibles', title: 'Collectibles', icon: Diamond, desc: 'High-end watches, rare cars, and other tangible luxury assets.' }
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8"
        >
          <CoinsIcon className="w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-6"
        >
          Tangible assets, fully integrated.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 mb-10"
        >
          Access rare coins and alternative assets to hedge against inflation, all managed from your core brokerage account.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/signup" className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block">
            Explore Alternatives
          </Link>
        </motion.div>
      </section>

      {/* Categories Grid (Interactive flip cards logic) */}
      <section className="py-24 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Alternative Asset Classes</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Click a category to see how we handle valuation and custody for physical assets.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="perspective-1000 h-[280px]"
              >
                <div 
                  className={`w-full h-full relative preserve-3d cursor-pointer transition-transform duration-500 ${activeCategory === cat.id ? 'rotate-y-180' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center hover:border-slate-300 hover:shadow-md transition-all">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <cat.icon className="w-8 h-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">{cat.title}</h3>
                    <div className="mt-auto text-sm text-slate-500 flex items-center gap-1">
                      Click for details <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold font-heading mb-4">{cat.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">{cat.desc}</p>
                    <div className="mt-auto text-sm text-slate-400 flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Back
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custody explanation */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <FileHeart className="w-12 h-12 text-slate-300 mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">How physical custody works.</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          For tangible assets like rare coins, we handle fully insured, climate-controlled vault storage via our trusted partners (e.g., Brink's). The asset's appraised value automatically updates in your digital dashboard.
        </p>
        <Link to="/agents" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
          Speak with an Alt-Assets Specialist <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
