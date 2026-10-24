import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, HeartHandshake, CheckCircle2 } from 'lucide-react';

export function InsuranceLinked() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8"
        >
          <HeartHandshake className="w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-6"
        >
          Where protection and growth meet.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 mb-10"
        >
          Annuities and permanent life products that provide a death benefit while building tax-advantaged cash value.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/insurance/quote" className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block">
            Explore Policies
          </Link>
        </motion.div>
      </section>

      {/* Explainer */}
      <section className="py-24 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">More than just a safety net.</h2>
              <p className="text-lg text-slate-600 mb-6">
                Traditional insurance is a sunk cost. Insurance-linked investments take a portion of your premium and allocate it into a cash value account, allowing it to grow over time.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 mt-1" />
                  <span className="text-slate-700 font-medium">Tax-advantaged growth potential</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 mt-1" />
                  <span className="text-slate-700 font-medium">Guaranteed death benefit</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-900 mt-1" />
                  <span className="text-slate-700 font-medium">Ability to borrow against cash value</span>
                </li>
              </ul>
            </div>
            
            <div className="relative">
              {/* Diagrammatic animation container */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden aspect-square flex flex-col items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="w-32 h-32 rounded-full border-4 border-slate-200 flex items-center justify-center relative z-10 bg-white"
                >
                  <span className="font-bold text-slate-900">Premium</span>
                </motion.div>
                
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: 40 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="w-1 bg-slate-200 relative z-0 -my-1"
                />
                
                <div className="flex gap-8 mt-4 relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-24 h-24 rounded-full border-4 border-slate-900 flex items-center justify-center bg-slate-50 text-center p-2 text-sm font-semibold text-slate-900">
                      Death Benefit
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-24 h-24 rounded-full border-4 border-slate-400 flex items-center justify-center bg-slate-50 text-center p-2 text-sm font-semibold text-slate-900">
                      Cash Value
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-6" />
        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">Talk to a specialist to see if it fits.</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          These products are complex and require underwriting. Our licensed agents can help you model out scenarios to see if it makes sense for your estate planning.
        </p>
        <Link to="/agents" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
          Find an Agent <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
