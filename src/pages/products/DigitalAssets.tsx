import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Bitcoin, ShieldAlert, Lock, ArrowRight, Wallet, LineChart } from 'lucide-react';

export function DigitalAssets() {
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
              <Bitcoin className="w-4 h-4" /> Next-Gen Wealth
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-6 leading-[1.1]"
            >
              Digital assets, held to the same standard.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl"
            >
              Secure custody and trading for major cryptocurrencies alongside your traditional investments. Built for long-term investors, not day traders.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/signup" className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block">
                Start Trading Crypto
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
              src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop" 
              alt="Bitcoin token held over financial chart" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl flex items-center justify-between text-white">
                <div>
                  <div className="text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <Bitcoin className="w-4 h-4 text-white" />
                    </div>
                    Bitcoin (BTC)
                  </div>
                  <div className="text-3xl font-bold">$64,210.50</div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                    <LineChart className="w-4 h-4" /> +2.4%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security & Custody */}
      <section className="py-24 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative h-[500px] rounded-[2rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop" 
                alt="Secure server data center" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/20" />
            </div>
            
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-3xl font-bold font-heading text-slate-900">Institutional-grade custody.</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Cold Storage</h3>
                    <p className="text-slate-600 leading-relaxed">We partner with regulated custodians to ensure 95% of your digital assets are protected offline in multi-signature vaults.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Crime Insurance</h3>
                    <p className="text-slate-600 leading-relaxed">Your digital holdings are backed by extensive crime insurance covering digital asset theft from hot and cold storage.</p>
                  </div>
                </div>
              </div>
              
              <Link to="/learn/glossary#custody" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all pt-4">
                Learn how custody works <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Assets Grid */}
      <section className="py-24">
        <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Supported Assets</h2>
            <p className="text-slate-600">We carefully select high-liquidity assets for our platform.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'USDC', 'Cardano (ADA)', 'Polkadot (DOT)', 'Chainlink (LINK)', 'Polygon (MATIC)'].map((coin, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-slate-300 transition-colors group cursor-default"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <span className="font-medium text-slate-700 text-center text-sm">{coin}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden text-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-50" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-50" />
             <ShieldAlert className="w-12 h-12 mb-6 text-slate-400 mx-auto" />
             <h3 className="text-2xl font-bold mb-4 font-heading">Risk Disclosure</h3>
             <p className="text-slate-400 text-base leading-relaxed max-w-3xl mx-auto">
               Cryptocurrency is a highly speculative asset class. Unlike equities, digital assets are not covered by SIPC insurance, and prices can be extremely volatile. Summit Vault Capital offers these products for portfolio diversification, but they should only represent a portion of your overall allocation.
             </p>
        </div>
      </section>
    </div>
  );
}
