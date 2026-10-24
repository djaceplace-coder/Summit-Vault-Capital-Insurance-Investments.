import { motion } from 'motion/react';
import { X, FileText, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function ClaimModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  const handleNextStep = (nextStep: 2 | 3) => {
    setStep(nextStep);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 relative">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">File a Claim</h2>
            <p className="text-sm text-slate-500">
              {step === 1 ? 'Step 1: Incident Details' : step === 2 ? 'Step 2: Evidence Upload' : 'Step 3: Review & Submit'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Autosave Toast */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: showToast ? 1 : 0, y: showToast ? 0 : -10 }}
            className="absolute top-6 right-16 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Draft saved
          </motion.div>
        </div>

        {step === 1 && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Policy</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow">
                <option>No active policies available</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date of Incident</label>
              <input 
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description of Incident</label>
              <textarea 
                rows={4}
                placeholder="Please describe what happened..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow resize-none"
              ></textarea>
            </div>
            <button 
              onClick={() => handleNextStep(2)}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Next: Upload Evidence
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <div className="text-sm font-medium text-slate-900 mb-1">Click to upload or drag and drop</div>
              <div className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB (Photos, Police Reports, Receipts)</div>
            </div>
            
            <div className="space-y-3">
               {/* Mock file item */}
               <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">police_report.pdf</div>
                      <div className="text-xs text-slate-500">2.4 MB</div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 py-4 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => handleNextStep(3)}
                className="w-2/3 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Review Claim
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <span className="font-semibold block mb-1">Declaration of Truth</span>
                By submitting this claim, you declare that all information provided is true and accurate to the best of your knowledge. False claims may result in policy cancellation or legal action.
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Submit Claim
            </button>
            
            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 text-slate-600 font-medium hover:text-slate-900 transition-colors"
            >
              Back to Evidence
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
