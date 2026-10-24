import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Home as HomeIcon, Umbrella, ArrowRight } from 'lucide-react';

export function Insurance() {
  const lines = [
    { id: 'life', title: 'Life Insurance', desc: 'Term and permanent protection for your family\'s future.', icon: Heart, href: '/insurance/life' },
    { id: 'health', title: 'Health Insurance', desc: 'Comprehensive coverage options for individuals and families.', icon: Umbrella, href: '/insurance/health' },
    { id: 'property', title: 'Property & Casualty', desc: 'Protect your home, vehicles, and valuables from the unexpected.', icon: HomeIcon, href: '/insurance/property' },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-20 pb-16 lg:pt-24 lg:pb-20 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8"
        >
          <ShieldCheck className="w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl leading-tight sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
        >
          Coverage built by people who've done this for 30 years.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Don't just buy a policy. Build a moat around your wealth with integrated insurance and brokerage services.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link to="/insurance/quote" className="bg-slate-900 text-white px-8 py-4 sm:py-4.5 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block w-full sm:w-auto shadow-md">
            Get a Quote
          </Link>
          <Link to="/agents" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 sm:py-4.5 rounded-full text-base font-medium hover:bg-slate-50 transition-all active:scale-95 inline-block w-full sm:w-auto shadow-sm">
            Find an Agent
          </Link>
        </motion.div>
      </section>

      {/* Lines of Business */}
      <section className="py-24 bg-slate-50">
        <div className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 sm:gap-6">
            {lines.map((line, i) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[280px] snap-center sm:min-w-0"
              >
                <Link 
                  to={line.href}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all group flex flex-col h-full active:scale-95 sm:active:scale-100"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors shadow-sm">
                    <line.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2 sm:mb-3 text-slate-900">{line.title}</h3>
                  <p className="text-slate-600 text-sm mb-auto leading-relaxed">{line.desc}</p>
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-2 group-hover:gap-3 transition-all mt-6">
                    Explore Options <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explainer */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">Why bundle investing and insurance?</h2>
            <p className="text-lg text-slate-600 mb-6">
              When your broker and your insurance agent are on the same platform, your financial plan actually works together. We can use your assets to underwrite better policies, and use policies to protect your assets.
            </p>
            <Link to="/products/insurance-linked" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
              Learn about Insurance-Linked Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Venn Diagram Animation */}
          <div className="relative h-64 flex items-center justify-center">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 20, opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
              className="absolute w-48 h-48 rounded-full bg-slate-200 mix-blend-multiply flex items-center justify-start pl-8"
            >
              <span className="font-bold text-slate-700 font-heading">Protection</span>
            </motion.div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: -20, opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring", delay: 0.2 }}
              className="absolute w-48 h-48 rounded-full bg-slate-300 mix-blend-multiply flex items-center justify-end pr-10"
            >
              <span className="font-bold text-slate-800 font-heading">Growth</span>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
