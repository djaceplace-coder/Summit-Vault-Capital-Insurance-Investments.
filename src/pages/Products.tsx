import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Bitcoin, 
  Coins, 
  HeartHandshake, 
  PieChart, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export function Products() {
  const products = [
    { title: "Stocks & Equities", desc: "Trade global equities with deep liquidity.", icon: TrendingUp, href: "/products/stocks" },
    { title: "Digital Assets & Crypto", desc: "Secure custody for major digital assets.", icon: Bitcoin, href: "/products/digital-assets" },
    { title: "Coins & Alternative Assets", desc: "Access alternative asset classes.", icon: Coins, href: "/products/coins" },
    { title: "Insurance-Linked Products", desc: "Products that blend growth with protection.", icon: HeartHandshake, href: "/products/insurance-linked" },
    { title: "Managed Portfolios", desc: "Algorithmic allocation with human oversight.", icon: PieChart, href: "/products/managed" }
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-20 pb-16 lg:pt-24 lg:pb-20 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl leading-tight sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
        >
          One account. Every way to grow.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
        >
          Build a portfolio across all asset classes, managed seamlessly in one platform.
        </motion.p>
      </section>

      {/* Grid */}
      <section className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-24">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((prod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[280px] snap-center sm:min-w-0"
            >
              <Link 
                to={prod.href}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all group flex flex-col h-full active:scale-95 sm:active:scale-100"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors shadow-sm">
                  <prod.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 sm:mb-3 text-slate-900">{prod.title}</h3>
                <p className="text-slate-600 text-sm mb-auto leading-relaxed">{prod.desc}</p>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-2 group-hover:gap-3 transition-all mt-6">
                  Learn more <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Quiz CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: products.length * 0.1 }}
            className="min-w-[280px] snap-center sm:min-w-0"
          >
            <Link 
              to="/products/compare"
              className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 hover:bg-slate-800 transition-all group flex flex-col h-full relative overflow-hidden active:scale-95 sm:active:scale-100"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">Not sure where to start?</h3>
              <p className="text-slate-300 text-sm mb-auto">Take our 60-second fit quiz to find the right products for your goals.</p>
              <div className="text-sm font-medium text-white flex items-center gap-2 group-hover:gap-3 transition-all mt-6">
                Take the quiz <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Compare Asset Classes</h2>
            <p className="text-slate-600">A quick guide to finding your right fit.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-900">Product</th>
                  <th className="py-4 px-6 font-semibold text-slate-900">Risk Level</th>
                  <th className="py-4 px-6 font-semibold text-slate-900">Liquidity</th>
                  <th className="py-4 px-6 font-semibold text-slate-900">Minimum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">Stocks & Equities</td>
                  <td className="py-4 px-6 text-slate-600">Moderate to High</td>
                  <td className="py-4 px-6 text-slate-600">High (Daily)</td>
                  <td className="py-4 px-6 text-slate-600">$500</td>
                </tr>
                <tr className="hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">Digital Assets</td>
                  <td className="py-4 px-6 text-slate-600">High</td>
                  <td className="py-4 px-6 text-slate-600">High (24/7)</td>
                  <td className="py-4 px-6 text-slate-600">$100</td>
                </tr>
                <tr className="hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">Alternative Assets</td>
                  <td className="py-4 px-6 text-slate-600">Moderate</td>
                  <td className="py-4 px-6 text-slate-600">Low (Months/Years)</td>
                  <td className="py-4 px-6 text-slate-600">$10,000</td>
                </tr>
                <tr className="hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">Insurance-Linked</td>
                  <td className="py-4 px-6 text-slate-600">Low</td>
                  <td className="py-4 px-6 text-slate-600">Low (Fixed Terms)</td>
                  <td className="py-4 px-6 text-slate-600">$5,000</td>
                </tr>
                <tr className="hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">Managed Portfolios</td>
                  <td className="py-4 px-6 text-slate-600">Tailored</td>
                  <td className="py-4 px-6 text-slate-600">High (Daily)</td>
                  <td className="py-4 px-6 text-slate-600">$1,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
