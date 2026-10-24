import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Building2, Server, ShieldCheck, FileText, ArrowRight, Layers, LayoutTemplate, Users } from 'lucide-react';
import { useState } from 'react';

export function ForBusiness() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: "Brokerage Core", icon: Layers, content: "Access our ledger and trade execution engine via API. Support for equities, crypto, and fixed income." },
    { title: "Agent Tools", icon: Users, content: "White-label our advisor portal. Give your agents unified views of their book of business, compliance tracking, and integrated messaging." },
    { title: "Compliance", icon: ShieldCheck, content: "Automated KYC/AML flows, regulatory reporting, and FINRA-compliant archiving built in." },
    { title: "Client App", icon: LayoutTemplate, content: "Embed our modular UI components into your existing application, or deploy a fully branded version of our web and mobile apps." },
  ];

  // Needs Users icon, so import it
  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-5 sm:px-6 lg:px-8 w-full text-center z-10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1541888043653-5d55e884e93d?q=80&w=2000&auto=format&fit=crop" 
            alt="Classical architecture" 
            className="w-full h-full object-cover object-[center_30%] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl leading-tight sm:text-5xl lg:text-7xl font-bold font-heading text-slate-900 mb-6 tracking-tight"
          >
            The platform other agencies wish they had.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            We built our technology to solve our own problems. Now, we license our unified brokerage and insurance infrastructure to institutional partners.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <a href="#contact" className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 inline-block w-full sm:w-auto shadow-md">
              Request Demo
            </a>
            <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-base font-medium hover:bg-slate-50 transition-all active:scale-95 inline-flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm">
              <FileText className="w-5 h-5" /> Download Deck
            </button>
          </motion.div>
        </div>
      </section>

      {/* Abstract 3D Architecture Visual */}
      <section className="py-12 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-0">
        <div className="h-[300px] sm:h-[400px] w-full rounded-[2rem] bg-slate-900 overflow-hidden relative flex items-center justify-center group perspective-1000 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          
          {/* We simulate a 3D architecture stack with CSS transforms */}
          <div className="relative w-64 h-64 preserve-3d transition-transform duration-1000 ease-in-out group-hover:rotate-x-12 group-hover:-rotate-y-12">
            
            {/* Top Layer: UI */}
            <div className="absolute inset-0 bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl transform translate-z-[80px] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               <LayoutTemplate className="w-12 h-12 text-white/50" />
            </div>
            
            {/* Middle Layer: Logic */}
            <div className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm rounded-xl transform translate-z-[0px] flex items-center justify-center">
               <Server className="w-12 h-12 text-blue-400/50" />
            </div>

            {/* Bottom Layer: Data */}
            <div className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm rounded-xl transform translate-z-[-80px] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
               <Building2 className="w-12 h-12 text-emerald-400/50" />
            </div>

          </div>
          
          <div className="absolute bottom-8 text-white/50 text-sm font-medium tracking-widest uppercase">
            Platform Architecture
          </div>
        </div>
      </section>

      {/* Capabilities Interactive Tour */}
      <section className="py-24 bg-slate-50">
        <div className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">Modular Capabilities</h2>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            <div className="lg:col-span-5 flex flex-col gap-4">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    activeTab === i 
                      ? 'border-slate-900 bg-white shadow-md' 
                      : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${activeTab === i ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <tab.icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-lg ${activeTab === i ? 'text-slate-900' : 'text-slate-600'}`}>{tab.title}</h3>
                  </div>
                  <p className={`text-sm leading-relaxed ${activeTab === i ? 'text-slate-600' : 'text-slate-500'}`}>
                    {tab.content}
                  </p>
                </button>
              ))}
            </div>
            
            <div className="lg:col-span-7">
              <div className="bg-slate-200 rounded-3xl aspect-[4/3] w-full shadow-inner border border-slate-300 flex items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col p-6"
                  >
                    {/* Fake UI Wireframes to represent capabilities */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                      <div className="w-32 h-6 bg-slate-100 rounded-md" />
                      <div className="flex gap-2">
                         <div className="w-8 h-8 rounded-full bg-slate-100" />
                         <div className="w-8 h-8 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    
                    <div className="flex-1 flex gap-6">
                      <div className="w-1/3 flex flex-col gap-4">
                        <div className="w-full h-24 bg-slate-50 rounded-xl border border-slate-100" />
                        <div className="w-full h-24 bg-slate-50 rounded-xl border border-slate-100" />
                        <div className="w-full h-24 bg-slate-50 rounded-xl border border-slate-100" />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <div className="w-1/2 h-6 bg-slate-200 rounded-md mb-8" />
                        <div className="w-full h-48 bg-slate-200/50 rounded-lg" />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="contact" className="py-24 px-5 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-12">
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2 tracking-tight">Partner with us</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">Tell us about your firm and what capabilities you're looking to integrate.</p>
          
          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
              <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">How can we help?</label>
              <textarea rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" />
            </div>
            
            <button type="button" className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-slate-800 transition-all">
              Submit Inquiry
            </button>
          </form>
        </div>
      </section>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .translate-z-\\[80px\\] { transform: translateZ(80px); }
        .translate-z-\\[0px\\] { transform: translateZ(0px); }
        .translate-z-\\[-80px\\] { transform: translateZ(-80px); }
        .rotate-x-12 { transform: rotateX(12deg); }
        .-rotate-y-12 { transform: rotateY(-12deg); }
      `}</style>
    </div>
  );
}
