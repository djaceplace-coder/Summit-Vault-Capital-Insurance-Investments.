import { motion } from 'motion/react';
import { ArrowLeft, Clock, Share2, Bookmark, Twitter, Linkedin, Copy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export function Article() {
  const { id } = useParams();

  // Mock article content based on ID
  return (
    <div className="flex flex-col w-full overflow-hidden bg-white">
      {/* Progress Bar (Mock) */}
      <div className="fixed top-0 left-0 h-1 bg-slate-900 w-1/3 z-50" />

      <article className="pt-24 lg:pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          
          {/* Back & Meta */}
          <div className="mb-10">
            <Link to="/learn" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
            </Link>
            
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">Wealth Management</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> 7 min read</span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 leading-[1.15] mb-6 tracking-tight"
            >
              The Modern Moat: How to Structure a Resilient Multi-Asset Portfolio
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 leading-relaxed mb-8"
            >
              In an era of unprecedented market velocity, traditional 60/40 splits are no longer enough. Here is how institutional investors are building downside protection into every layer of their wealth.
            </motion.p>

            <div className="flex items-center justify-between py-6 border-y border-slate-100">
              <div className="flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60" alt="Author" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-slate-900">Rachel Thorne</div>
                  <div className="text-sm text-slate-500">Chief Investment Officer</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"><Twitter className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"><Linkedin className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"><Copy className="w-5 h-5" /></button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"><Bookmark className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl overflow-hidden aspect-[21/9] mb-12 shadow-sm"
          >
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80" alt="Article Hero" className="w-full h-full object-cover" />
          </motion.div>

          {/* Article Body */}
          <div className="prose prose-lg prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-slate-900 prose-img:rounded-2xl">
            <p>
              For decades, the standard playbook for wealth preservation was remarkably simple: allocate sixty percent to equities for growth, and forty percent to fixed income for stability. It was an elegant solution for a different era. Today, macroeconomic shifts, algorithmic trading volatility, and the emergence of entirely new asset classes have rendered this approach functionally obsolete for high-net-worth individuals.
            </p>
            
            <h2>The New Definition of Diversification</h2>
            <p>
              True diversification no longer means just owning different stocks. It means owning different <em>behaviors</em>. When the S&P 500 drops, you need assets in your portfolio that don't just hold their value, but actively respond to the inverse condition.
            </p>
            
            <blockquote>
              "We don't build portfolios to withstand a light breeze. We structure them so that when the storm hits, the foundation actually hardens."
            </blockquote>
            
            <p>
              This is where integrated insurance solutions become critical. By wrapping specific equity portfolios in insurance-linked contracts (such as bespoke Private Placement Life Insurance or structured annuities), investors can achieve tax-advantaged compounding while defining strict floors on their downside risk.
            </p>

            <h3>Core Pillars of the Modern Moat</h3>
            <ul>
              <li><strong>Algorithmic Tax-Loss Harvesting:</strong> Continuously optimizing cost basis across all taxable accounts without manual intervention.</li>
              <li><strong>Non-Correlated Alternatives:</strong> Direct exposure to private credit, real estate, and digital assets that do not move in lockstep with public markets.</li>
              <li><strong>Insurance Integration:</strong> Using high-cash-value policies as a volatility buffer and tax-efficient wealth transfer mechanism.</li>
            </ul>

            <div className="my-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <h4 className="text-xl font-bold font-heading mb-2">Ready to audit your portfolio?</h4>
              <p className="text-base text-slate-600 mb-6">Our advisors can run a stress-test against your current allocations to identify vulnerabilities.</p>
              <Link to="/agents" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">Speak to an Advisor</Link>
            </div>

            <p>
              The most significant risk in the current market environment isn't volatility—it's holding a portfolio designed for 1995. By blending modern asset classes with institutional-grade insurance architecture, you can build a moat that protects your legacy for generations.
            </p>
          </div>

        </div>
      </article>
    </div>
  );
}
