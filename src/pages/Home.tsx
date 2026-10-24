import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  ShieldCheck, 
  Users, 
  Building2, 
  TrendingUp, 
  Bitcoin, 
  Coins, 
  HeartHandshake, 
  PieChart, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Award,
  Shield,
  Layers
} from 'lucide-react';

export function Home() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };

  return (
    <div className="flex flex-col w-full overflow-hidden bg-slate-50">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-44 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Cinematic Alpine Summit & Modern Vault Architecture Hero Image */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem] sm:rounded-b-[3.5rem] shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2400&auto=format&fit=crop" 
            alt="Summit Vault Capital Alpine Headquarters" 
            className="w-full h-full object-cover object-[center_35%]"
          />
          {/* Multi-layered luxurious gradient masks */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 sm:via-slate-900/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        <motion.div 
          className="max-w-3xl relative z-10 text-white"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow Label */}
          <motion.div variants={fadeInUp} className="mb-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-amber-500/15 border border-amber-400/30 text-amber-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Institutional Brokerage & Asset Protection
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-7xl font-bold font-heading text-white leading-[1.08] mb-6 tracking-tight drop-shadow-sm"
          >
            Sovereign Wealth. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              Ironclad Security.
            </span><br />
            Total Agility.
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-base sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-normal"
          >
            Summit Vault Capital unites high-conviction multi-asset investment brokerage with comprehensive private insurance. Safeguard your capital, compound your upside, and protect your generational legacy.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-amber-900/30 active:scale-95 text-center flex items-center justify-center gap-2"
            >
              Open Your Vault <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/insurance/quote" 
              className="bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700/80 px-8 py-4 rounded-xl text-base font-semibold transition-all active:scale-95 text-center backdrop-blur-md shadow-sm"
            >
              Get Covered
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-6 text-sm text-slate-300">
            <Link to="/agents" className="inline-flex items-center gap-2 hover:text-amber-400 font-medium transition-colors">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Consult an Accredited Fiduciary</span>
            </Link>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SIPC Insured Custody</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Institutional Proof Metrics Strip */}
      <section className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full -mt-10 sm:-mt-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { metric: "$4.2B+", label: "Assets Safeguarded", sub: "Global Institutional Custody" },
            { metric: "30+ Yrs", label: "Fiduciary Heritage", sub: "Since 1996 in Nevada & EU" },
            { metric: "100%", label: "Segregated Vaults", sub: "Tier-1 Depository Backing" },
            { metric: "A+ Rated", label: "Underwriting Partners", sub: "Leading Reinsurance Panels" }
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col justify-between"
            >
              <div className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1">{item.metric}</div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Capabilities Fork */}
      <section className="pt-20 pb-16 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-3">
            A Complete Fiduciary Fortress
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose your gateway into Summit Vault Capital. Every product is synchronized into one unified portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[
            { title: "Investment Brokerage", desc: "Equities, algorithmic allocations, digital assets, and high-yield fixed income.", icon: Briefcase, href: "/products", badge: "Wealth Growth" },
            { title: "Asset Protection", desc: "Bespoke life, liability, executive indemnity, and property underwriting.", icon: ShieldCheck, href: "/insurance", badge: "Capital Guard" },
            { title: "Private Advisory", desc: "Dedicated human wealth advisors and licensed estate planning fiduciaries.", icon: Users, href: "/agents", badge: "Personalized" },
            { title: "Institutional & Corp", desc: "Treasury management, partner custody, and corporate insurance programs.", icon: Building2, href: "/for-business", badge: "Corporate" }
          ].map((item, i) => (
            <Link 
              key={i} 
              to={item.href}
              className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-900/5 transition-all group flex flex-col items-start hover:-translate-y-1"
            >
              <div className="w-full flex items-center justify-between mb-5">
                <div className="p-3 bg-amber-500/10 text-amber-700 rounded-xl group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{item.badge}</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">{item.desc}</p>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:gap-2.5 transition-all">
                <span>Explore Solution</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. "Why Summit Vault" Fiduciary Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 block">
                The Summit Vault Advantage
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 mb-6 leading-tight">
                Accredited Institutional Oversight, Not Just an App.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
                For over three decades, we have shielded client capital during market turbulence and engineered alpha during expansions. We marry the digital speed of real-time brokerage with the battle-tested risk models of seasoned private bankers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/about" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors">
                  Learn About Our Model <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/insurance/quote" className="inline-flex items-center gap-2 border border-slate-200 text-slate-800 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                  Compare Coverage
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-1">30+</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">Years Operating</div>
                <p className="text-xs text-slate-500">Unbroken fiduciary continuity through four market cycles.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-amber-600 mb-1">$4.2B</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">Client Assets</div>
                <p className="text-xs text-slate-500">Institutional, family office, and private client allocations.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-1">100%</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">Direct Ownership</div>
                <p className="text-xs text-slate-500">Never rehypothecated. All client accounts legally segregated.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-3xl sm:text-4xl font-heading font-bold text-emerald-600 mb-1">48 Hr</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">Priority Claims</div>
                <p className="text-xs text-slate-500">Direct agent advocacy for swift, friction-free settlements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Asset Spectrum */}
      <section className="py-20 bg-slate-900 text-white rounded-t-[3rem] sm:rounded-none">
        <div className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12 sm:mb-14">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">Comprehensive Catalog</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">Engineered for Sovereign Growth.</h2>
              <p className="text-slate-400 text-base max-w-xl mt-2 leading-relaxed">
                One master account grants instant execution across global equities, physical vault alternatives, and insurance-linked assets.
              </p>
            </div>
            <Link to="/products" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap border border-slate-700">
              View All 30+ Assets
            </Link>
          </div>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-10 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-5">
          {[
            { title: "Stocks & Global Equities", desc: "Direct market access to NYSE, NASDAQ, and LSE with deep institutional liquidity.", icon: TrendingUp, href: "/products/stocks" },
            { title: "Digital Asset Custody", desc: "Military-grade cold storage vaults with cryptographic MPC multi-party governance.", icon: Bitcoin, href: "/products/digital-assets" },
            { title: "Precious Metals & Alts", desc: "Physical vault-allocated gold, bullion, and real-world tokenized assets.", icon: Coins, href: "/products/coins" },
            { title: "Insurance-Linked Yield", desc: "Sophisticated hybrid contracts that fuse capital growth with downside principal protection.", icon: HeartHandshake, href: "/products/insurance-linked" },
            { title: "Algorithmic Wealth Models", desc: "Automated institutional portfolio rebalancing monitored 24/7 by accredited traders.", icon: PieChart, href: "/products/managed" }
          ].map((prod, i) => (
            <Link 
              key={i}
              to={prod.href}
              className="min-w-[280px] sm:min-w-[320px] bg-slate-950/70 hover:bg-slate-950 p-8 rounded-3xl snap-start border border-slate-800 transition-all group flex flex-col h-[280px] hover:border-amber-500/40"
            >
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <prod.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2 text-white group-hover:text-amber-300 transition-colors">{prod.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-auto">{prod.desc}</p>
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2 group-hover:gap-3 transition-all mt-4">
                <span>Examine Asset Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. High-Conviction Insurance Claim Assurance */}
      <section className="py-20 bg-white">
        <div className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/80 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="lg:w-1/2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 block">
                Frictionless Settlement
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 mb-5 tracking-tight">
                Insurance That Actually Delivers When Required.
              </h2>
              <p className="text-base text-slate-600 mb-6 leading-relaxed">
                When adverse market or life events occur, you deserve rapid resolution without corporate bureaucracy. Our licensed agents act as your personal advocates.
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "24/7 priority emergency concierge dispatch",
                  "Direct agent advocacy across underwriting panels",
                  "Fast-tracked settlement verification for policyholders",
                  "Full transparency through the Summit Vault client portal"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/insurance/quote" 
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
              >
                Start Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden relative shadow-xl border border-slate-200/60">
                <img 
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=60" 
                  alt="Senior Wealth Advisory" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-white">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">Performance Standard</div>
                  <div className="text-2xl font-bold font-heading">Under 48 Hours Average Settlement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
