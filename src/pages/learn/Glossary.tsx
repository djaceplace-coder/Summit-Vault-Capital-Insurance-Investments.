import { motion } from 'motion/react';
import { Search, BookA } from 'lucide-react';
import { useState } from 'react';

const glossaryTerms = [
  { term: "Alpha", def: "The excess return of an investment relative to the return of a benchmark index.", letter: "A" },
  { term: "Asset Allocation", def: "An investment strategy that aims to balance risk and reward by apportioning a portfolio's assets according to an individual's goals, risk tolerance, and investment horizon.", letter: "A" },
  { term: "Basis Point (BPS)", def: "A common unit of measure for interest rates and other percentages in finance. One basis point is equal to 1/100th of 1%, or 0.01%.", letter: "B" },
  { term: "Beta", def: "A measure of the volatility, or systematic risk, of a security or a portfolio in comparison to the market as a whole.", letter: "B" },
  { term: "Cash Value", def: "The portion of a permanent life insurance policy that earns interest and is available for the policyholder to withdraw or borrow against.", letter: "C" },
  { term: "Digital Asset", def: "Anything that exists in a binary format and comes with the right to use it. Often refers to cryptocurrencies, tokens, and digital securities.", letter: "D" },
  { term: "Drawdown", def: "The peak-to-trough decline during a specific period for an investment, trading account, or fund.", letter: "D" },
  { term: "Equities", def: "Shares of ownership in a company. Represents a claim on part of the corporation's assets and earnings.", letter: "E" },
  { term: "Fiduciary", def: "A person or organization that acts on behalf of another person or persons, putting their clients' interest ahead of their own, with a duty to preserve good faith and trust.", letter: "F" },
  { term: "Liquidity", def: "The degree to which an asset or security can be quickly bought or sold in the market without affecting the asset's price.", letter: "L" },
  { term: "Moat", def: "A competitive advantage that a company has over other companies in the same industry. In personal finance, a structure of assets and insurance protecting wealth.", letter: "M" },
  { term: "PPLI", def: "Private Placement Life Insurance. A highly customized, variable universal life insurance policy designed for high-net-worth individuals to invest in alternative asset classes in a tax-efficient manner.", letter: "P" },
  { term: "Yield", def: "The income returned on an investment, such as the interest received from holding a security.", letter: "Y" }
];

export function Glossary() {
  const [search, setSearch] = useState("");
  
  const filteredTerms = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(search.toLowerCase()) || 
    t.def.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredTerms.reduce((acc, curr) => {
    if (!acc[curr.letter]) acc[curr.letter] = [];
    acc[curr.letter].push(curr);
    return acc;
  }, {} as Record<string, typeof glossaryTerms>);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Hero */}
      <section className="pt-20 pb-16 lg:pt-24 lg:pb-20 px-5 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-slate-900"
        >
          <BookA className="w-8 h-8" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl leading-tight sm:text-5xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
        >
          Financial Glossary
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Clear, concise definitions for the concepts and terminology used across our platform and the broader financial industry.
        </motion.p>

        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for a term..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-slate-900 rounded-2xl outline-none transition-all shadow-sm text-lg"
          />
        </div>
      </section>

      {/* Glossary List */}
      <section className="px-5 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pb-24">
        {Object.keys(grouped).sort().length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No terms found matching "{search}"
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(grouped).sort().map(letter => (
              <div key={letter} className="relative">
                <div className="sticky top-20 bg-white/90 backdrop-blur-md py-4 z-10 border-b border-slate-100 mb-6">
                  <h2 className="text-3xl font-bold font-heading text-slate-900">{letter}</h2>
                </div>
                <div className="grid gap-6 pl-0 sm:pl-8 border-l-0 sm:border-l-2 border-slate-100">
                  {grouped[letter].map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={item.term} 
                      className="bg-slate-50 p-6 sm:p-8 rounded-3xl"
                    >
                      <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">{item.term}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.def}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
