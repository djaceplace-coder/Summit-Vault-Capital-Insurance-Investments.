import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function LineOfBusiness() {
  const { type } = useParams<{ type: string }>();
  const [isAnnual, setIsAnnual] = useState(false);

  // Content mapped by route parameter
  const content = {
    life: {
      title: "Life Insurance",
      desc: "Secure your family's future with term or permanent coverage tailored to your estate plan.",
      tiers: [
        { name: "Term Life", priceBase: 35, features: ["Coverage for 10-30 years", "Fixed premiums", "Convertible to permanent"] },
        { name: "Whole Life", priceBase: 120, features: ["Lifelong coverage", "Builds cash value", "Fixed premiums"] },
        { name: "Universal Life", priceBase: 150, features: ["Lifelong coverage", "Flexible premiums", "Adjustable death benefit"] }
      ]
    },
    health: {
      title: "Health Insurance",
      desc: "Comprehensive coverage options to keep you and your family protected from unexpected medical costs.",
      tiers: [
        { name: "Essential", priceBase: 250, features: ["Preventive care 100% covered", "High deductible", "HSA compatible"] },
        { name: "Standard", priceBase: 450, features: ["Lower copays", "Moderate deductible", "Broad network"] },
        { name: "Premium", priceBase: 700, features: ["Lowest out-of-pocket costs", "No referrals needed", "Extensive network coverage"] }
      ]
    },
    property: {
      title: "Property & Casualty",
      desc: "Protect your physical assets: home, vehicles, and valuables.",
      tiers: [
        { name: "Renters / Basic", priceBase: 20, features: ["Personal property", "Liability coverage", "Loss of use"] },
        { name: "Homeowners", priceBase: 110, features: ["Dwelling coverage", "Personal property", "Liability & Medical"] },
        { name: "High-Value Home", priceBase: 350, features: ["Extended replacement cost", "Valuable articles blanket", "Identity theft protection"] }
      ]
    }
  };

  const data = content[type as keyof typeof content] || content.life;

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-6 capitalize"
        >
          {data.title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600"
        >
          {data.desc}
        </motion.p>
      </section>

      {/* Coverage Tiers */}
      <section className="py-16 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          
          <div className="flex justify-center mb-12">
            <div className="bg-slate-200 p-1 rounded-full inline-flex relative">
              <div 
                className="absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm transition-transform duration-300"
                style={{ transform: isAnnual ? 'translateX(100%)' : 'translateX(0)' }}
              />
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors ${!isAnnual ? 'text-slate-900' : 'text-slate-600'}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors ${isAnnual ? 'text-slate-900' : 'text-slate-600'}`}
                onClick={() => setIsAnnual(true)}
              >
                Annually
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {data.tiers.map((tier, i) => {
              const price = isAnnual ? tier.priceBase * 11 : tier.priceBase; // 1 month free if annual
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <div className="mb-6">
                    <span className="text-sm text-slate-500">Starting from</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-bold font-heading text-slate-900">${price}</span>
                      <span className="text-slate-500">/{isAnnual ? 'yr' : 'mo'}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {tier.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
                        <span className="text-slate-700 text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={`/insurance/quote?type=${type}&tier=${i}`} className="w-full py-3 px-4 rounded-xl font-medium text-center transition-colors bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200">
                    Get a Quote
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6">Need a custom policy?</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Our agents can help you design a policy tailored precisely to your estate and business needs.
        </p>
        <Link to="/agents" className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:gap-3 transition-all">
          Talk to an Agent <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
