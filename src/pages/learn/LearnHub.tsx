import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, PlayCircle } from 'lucide-react';
import { useState } from 'react';

const articles = [
  { id: '1', title: 'Understanding Whole vs Term Life', category: 'Insurance', date: 'Oct 12, 2026', author: 'Elena Rodriguez', img: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=60' },
  { id: '2', title: 'The Role of Crypto in Modern Portfolios', category: 'Crypto', date: 'Oct 05, 2026', author: 'David Chen', img: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60' },
  { id: '3', title: 'Why Summit Vault Capital Chooses the Agency Model', category: 'General', date: 'Sep 28, 2026', author: 'Michael Sterling', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60' },
  { id: '4', title: 'Hedging with Alternative Assets', category: 'Stocks', date: 'Sep 15, 2026', author: 'Marcus Johnson', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60' },
];

export function LearnHub() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Featured / Hero */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-end mb-12">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-6"
            >
              Insights & Education
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 max-w-2xl"
            >
              Learn how to build, protect, and pass on wealth from our accredited advisors.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-96 relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-slate-900 rounded-xl outline-none transition-all shadow-sm"
            />
          </motion.div>
        </div>
        
        {/* Featured Article */}
        {!searchTerm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-slate-100 shadow-sm mb-16"
          >
            <img src={articles[0].img} alt={articles[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:w-2/3">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                Featured • {articles[0].category}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4 leading-tight">
                {articles[0].title}
              </h2>
              <div className="flex items-center gap-4 text-slate-300 text-sm font-medium mb-8">
                <span>By {articles[0].author}</span>
                <span>•</span>
                <span>{articles[0].date}</span>
              </div>
              <Link to={`/learn/article/${articles[0].id}`} className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors">
                Read Article <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </section>

      {/* Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24">
        <h3 className="text-2xl font-bold font-heading text-slate-900 mb-8">Latest Articles</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={article.id} 
              className="flex flex-col group cursor-pointer"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 mb-6 shadow-sm group-hover:shadow-md transition-all">
                <img src={article.img} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                <span className="text-slate-900">{article.category}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h4 className="text-xl font-bold font-heading text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                <Link to={`/learn/article/${article.id}`}>{article.title}</Link>
              </h4>
              <div className="mt-auto text-sm font-medium text-slate-600">
                By {article.author}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools / Glossary Banner */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-8 sm:p-12 rounded-3xl border border-slate-700">
              <h3 className="text-2xl font-bold font-heading mb-4">Financial Glossary</h3>
              <p className="text-slate-400 mb-8 max-w-md">Decode complex financial and insurance jargon with our comprehensive alphabetical guide.</p>
              <Link to="/learn/glossary" className="inline-flex items-center gap-2 font-semibold text-white hover:gap-3 transition-all">
                Browse Terms <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-slate-800/50 p-8 sm:p-12 rounded-3xl border border-slate-700 flex flex-col justify-center">
              <PlayCircle className="w-12 h-12 text-slate-400 mb-6" />
              <h3 className="text-2xl font-bold font-heading mb-4">Webinars & Events</h3>
              <p className="text-slate-400 mb-8">Join our agents live as they discuss market trends, estate planning strategies, and more.</p>
              <Link to="/learn/events" className="inline-flex items-center gap-2 font-semibold text-white hover:gap-3 transition-all">
                View Schedule <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
