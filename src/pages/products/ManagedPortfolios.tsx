import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PieChart, BrainCircuit, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function ManagedPortfolios() {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // Fake chart data for the interactive donut
  const allocation = [
    { label: 'US Equities', percent: 45, color: 'bg-slate-900', hoverColor: 'bg-slate-800' },
    { label: 'International', percent: 20, color: 'bg-slate-700', hoverColor: 'bg-slate-600' },
    { label: 'Fixed Income', percent: 25, color: 'bg-slate-500', hoverColor: 'bg-slate-400' },
    { label: 'Alternatives', percent: 10, color: 'bg-slate-300', hoverColor: 'bg-slate-200' },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8"
        >
          <PieChart className="w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-6"
        >
          Algorithmic allocation. Human oversight.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
        >
          Set your goals and let our automated rebalancing engine do the work, continually monitored by our investment committee.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/products/compare" className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block">
            Find Your Portfolio Fit
          </Link>
        </motion.div>
      </section>

      {/* How it works & Chart */}
      <section className="py-24 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading text-slate-900 mb-8">How our engine works</h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">1. Smart Profiling</h3>
                    <p className="text-slate-600">We assess your risk tolerance, time horizon, and insurance coverage to build a tailored portfolio.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">2. Automated Rebalancing</h3>
                    <p className="text-slate-600">As markets move, our algorithm automatically buys/sells to keep your asset allocation on target.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">3. Human Review</h3>
                    <p className="text-slate-600">Unlike pure robo-advisors, our investment committee adjusts the underlying models based on macroeconomic conditions.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Allocation Visual (Fake donut chart via CSS) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-8 w-full text-center">Sample Balanced Portfolio</h3>
              
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                {/* CSS Donut approximation */}
                <div className="relative w-48 h-48 rounded-full flex items-center justify-center overflow-hidden bg-slate-100">
                  {/* Very simplified CSS segments for visualization purposes */}
                  <div className="absolute inset-0 bg-slate-900 clip-segment-1 transition-opacity duration-300" style={{ opacity: hoveredSegment === null || hoveredSegment === 0 ? 1 : 0.3 }} />
                  <div className="absolute inset-0 bg-slate-700 clip-segment-2 transition-opacity duration-300" style={{ opacity: hoveredSegment === null || hoveredSegment === 1 ? 1 : 0.3 }} />
                  <div className="absolute inset-0 bg-slate-500 clip-segment-3 transition-opacity duration-300" style={{ opacity: hoveredSegment === null || hoveredSegment === 2 ? 1 : 0.3 }} />
                  <div className="absolute inset-0 bg-slate-300 clip-segment-4 transition-opacity duration-300" style={{ opacity: hoveredSegment === null || hoveredSegment === 3 ? 1 : 0.3 }} />
                  
                  {/* Inner cutout */}
                  <div className="absolute w-32 h-32 bg-white rounded-full z-10 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-heading text-slate-900">
                      {hoveredSegment !== null ? allocation[hoveredSegment].percent + '%' : '100%'}
                    </span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  {allocation.map((item, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${hoveredSegment === i ? 'bg-slate-50' : ''}`}
                      onMouseEnter={() => setHoveredSegment(i)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 ml-4">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing simple */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
         <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">Simple, low fees.</h2>
         <div className="text-5xl font-bold font-heading text-slate-900 mb-2">0.25%</div>
         <p className="text-slate-500 mb-8">Annual advisory fee. No trading commissions or hidden charges.</p>
         
         <Link to="/signup" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
           Open an account <ArrowRight className="w-4 h-4" />
         </Link>
      </section>

      {/* Adding styles for the clip paths in the donut approximation */}
      <style>{`
        .clip-segment-1 { clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%); }
        .clip-segment-2 { clip-path: polygon(50% 50%, 50% 100%, 0% 100%, 0% 70%); }
        .clip-segment-3 { clip-path: polygon(50% 50%, 0% 70%, 0% 0%, 30% 0%); }
        .clip-segment-4 { clip-path: polygon(50% 50%, 30% 0%, 50% 0%); }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
