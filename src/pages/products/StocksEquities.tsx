import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, FileText, ArrowRight, TrendingUp, BarChart3, Globe } from 'lucide-react';

export function StocksEquities() {
  return (
    <div className="flex flex-col w-full overflow-hidden bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-sm font-semibold mb-6"
            >
              <TrendingUp className="w-4 h-4" /> Global Markets
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-6 leading-[1.1]"
            >
              Trade equities with the backing of a full brokerage.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl"
            >
              Access global markets with deep liquidity, low fees, and real human support when you need it. Build a resilient portfolio.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/signup?intent=equities" className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 text-center">
                Open an Account
              </Link>
              <Link to="/agents?specialty=equities" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-base font-medium hover:bg-slate-50 transition-all active:scale-95 text-center">
                Talk to a Specialist
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative h-[400px] lg:h-[600px] w-full rounded-[2rem] overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop" 
              alt="Stock market chart analysis on screen" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-500 mb-1">NASDAQ</div>
                  <div className="text-2xl font-bold text-slate-900">18,504.22</div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-4 h-4" /> +1.24%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Today</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Visualizations */}
      <section className="py-24 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative h-[500px] rounded-[2rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop" 
                alt="Professional stock trading setup" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-3xl font-bold font-heading text-slate-900">Institutional-grade tools, consumer-grade simplicity.</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Advanced Analytics</h3>
                    <p className="text-slate-600 leading-relaxed">Go beyond basic charts with our proprietary screening tools, options chains, and real-time level II market data.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Global Access</h3>
                    <p className="text-slate-600 leading-relaxed">Trade seamlessly across North American, European, and emerging market exchanges from a single unified account.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">How it works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Fund", desc: "Link your bank instantly or wire funds directly to your brokerage account.", icon: Building2 },
              { step: 2, title: "Choose", desc: "Access thousands of global stocks and ETFs with advanced screening tools.", icon: FileText },
              { step: 3, title: "Track", desc: "Monitor your performance in real-time alongside your insurance policies.", icon: ShieldCheck }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <item.icon className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Fees / FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">Transparent Pricing</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mt-8">
            <div>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-slate-400 text-sm">Commission on US Stocks</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-700" />
            <div>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-slate-400 text-sm">Account Minimums</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
           <Link to="/learn/stocks" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
             Read our Equities Guide <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </section>
    </div>
  );
}
