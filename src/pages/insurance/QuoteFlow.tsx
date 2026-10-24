import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

export function QuoteFlow() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    type: initialType,
    name: '',
    email: '',
    age: ''
  });

  const steps = [
    { title: "What do you need coverage for?", field: 'type' },
    { title: "Tell us about yourself", field: 'details' },
    { title: "Review & Result", field: 'result' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const progress = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl">
        
        {/* Header & Progress */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-slate-900 mb-6">Get your quote</h1>
          {currentStep < steps.length - 1 && (
            <div>
              <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                <span>Step {currentStep + 1} of {steps.length - 1}</span>
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Progress saved
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-slate-900 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Steps Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 flex flex-col h-full"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">{steps[0].title}</h2>
                <div className="space-y-3 mb-8">
                  {['Life', 'Health', 'Property', 'Business'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, type: type.toLowerCase() })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                        formData.type === type.toLowerCase() 
                          ? 'border-slate-900 bg-slate-50' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className={`font-medium ${formData.type === type.toLowerCase() ? 'text-slate-900' : 'text-slate-700'}`}>
                        {type} Insurance
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        formData.type === type.toLowerCase() ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                      }`}>
                        {formData.type === type.toLowerCase() && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-auto flex justify-end">
                  <button 
                    onClick={handleNext} 
                    disabled={!formData.type}
                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 flex flex-col h-full"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">{steps[1].title}</h2>
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                      placeholder="35"
                    />
                  </div>
                </div>
                <div className="mt-auto flex justify-between">
                  <button 
                    onClick={() => setCurrentStep(0)} 
                    className="text-slate-600 px-6 py-3 rounded-full font-medium hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={!formData.name || !formData.email || !formData.age}
                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Calculate Quote
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-12 text-center flex flex-col h-full items-center justify-center"
              >
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Your Estimated Quote</h2>
                <p className="text-slate-500 mb-8 capitalize">{formData.type} Insurance for {formData.name}</p>
                
                <div className="text-5xl font-bold font-heading text-slate-900 mb-2">$85 - $120</div>
                <p className="text-slate-500 mb-10">per month, pending final underwriting.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                  <Link to="/signup" className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-all text-center">
                    Continue Online
                  </Link>
                  <Link to="/agents" className="flex-1 bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-full font-medium hover:bg-slate-50 transition-all text-center">
                    Talk to an Agent
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
