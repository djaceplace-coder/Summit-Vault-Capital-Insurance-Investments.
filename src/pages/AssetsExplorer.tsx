import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, TrendingDown, Info, ShieldCheck, Activity, DollarSign, Database, Box } from 'lucide-react';
import { ASSETS, AssetClass } from '../data/assets';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';

export function AssetsExplorer() {
  const [activeTab, setActiveTab] = useState<AssetClass | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const classes: (AssetClass | 'All')[] = ['All', 'Equities', 'Crypto', 'Fixed Income', 'Commodities', 'Real Estate'];

  const filteredAssets = ASSETS.filter(asset => 
    (activeTab === 'All' || asset.assetClass === activeTab) &&
    (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-12 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-slate-900 mb-6 tracking-tight">Investment Assets Explorer</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Discover our comprehensive suite of over 30+ investable assets across multiple classes. Understand the risk, ROI algorithm, and core thesis behind every asset we offer.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full sm:w-auto pb-2 sm:pb-0">
            {classes.map(c => (
              <button 
                key={c}
                onClick={() => setActiveTab(c)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === c ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400"
            />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <motion.div 
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-700 text-sm">
                    {asset.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{asset.symbol}</h3>
                    <div className="text-sm text-slate-500">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  <div className={`text-sm font-medium flex items-center justify-end gap-1 ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(asset.change24h)}%
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  {asset.assetClass === 'Equities' && <Activity className="w-3 h-3" />}
                  {asset.assetClass === 'Crypto' && <Box className="w-3 h-3" />}
                  {asset.assetClass === 'Fixed Income' && <ShieldCheck className="w-3 h-3" />}
                  {asset.assetClass === 'Commodities' && <Database className="w-3 h-3" />}
                  {asset.assetClass === 'Real Estate' && <DollarSign className="w-3 h-3" />}
                  {asset.assetClass}
                </span>
                <span className={`ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                  ${asset.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    asset.riskLevel === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                    asset.riskLevel === 'High' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                    'bg-red-50 text-red-700 border-red-100'}`}
                >
                  Risk: {asset.riskLevel}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-6 flex-grow">{asset.description}</p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">ROI & Algorithmic Thesis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {asset.roiAlgorithm}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="text-center py-24 text-slate-500">
            No assets found matching your criteria.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
