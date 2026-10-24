import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, ChevronRight, RefreshCcw } from 'lucide-react';

export function CompareQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const questions = [
    {
      question: "What is your primary goal?",
      options: [
        "Grow my wealth aggressively over time.",
        "Protect what I have and pass it on securely.",
        "A mix of growth and downside protection.",
        "Diversify into alternative/digital assets."
      ]
    },
    {
      question: "How involved do you want to be?",
      options: [
        "I want to pick my own investments (DIY).",
        "I want it completely automated for me.",
        "I want human advice but ultimate control.",
        "I want a professional to handle everything."
      ]
    },
    {
      question: "What's your time horizon for these funds?",
      options: [
        "Less than 3 years.",
        "3 to 10 years.",
        "10+ years (Retirement).",
        "Legacy planning (Next generation)."
      ]
    }
  ];

  const handleSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [currentStep]: optionIndex });
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(questions.length); // Results step
      }
    }, 400); // Short delay to show selection
  };

  const restart = () => {
    setAnswers({});
    setCurrentStep(0);
  };

  const progress = (currentStep / questions.length) * 100;

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6">
      
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        {currentStep < questions.length && (
          <div className="mb-12">
            <div className="flex justify-between text-sm font-medium text-slate-500 mb-3">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Completed</span>
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

        {/* Question Area */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentStep < questions.length ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-12"
              >
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-8">
                  {questions[currentStep].question}
                </h2>
                
                <div className="space-y-4">
                  {questions[currentStep].options.map((opt, i) => {
                    const isSelected = answers[currentStep] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group ${
                          isSelected 
                            ? 'border-slate-900 bg-slate-50' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                          {opt}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-200 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              /* Results Step */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-12 text-center"
              >
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Your personalized match</h2>
                <p className="text-slate-600 mb-8">Based on your goals and involvement preference, we recommend looking into these products:</p>
                
                <div className="space-y-4 text-left mb-10">
                  <Link to="/products/managed" className="block p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-900 transition-colors group">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">Managed Portfolios</h3>
                    <p className="text-slate-600 text-sm mb-4">Perfect for a hands-off approach to wealth accumulation.</p>
                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                      Explore Product <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                  <Link to="/products/insurance-linked" className="block p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-900 transition-colors group">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">Insurance-Linked Products</h3>
                    <p className="text-slate-600 text-sm mb-4">Ideal for combining legacy protection with tax-advantaged growth.</p>
                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                      Explore Product <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="bg-slate-900 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button onClick={restart} className="text-slate-600 font-medium px-8 py-3 hover:bg-slate-50 rounded-full transition-colors flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> Retake Quiz
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
