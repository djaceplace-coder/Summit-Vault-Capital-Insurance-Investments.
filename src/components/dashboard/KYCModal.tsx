import { motion } from 'motion/react';
import { X, Camera, UploadCloud, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function KYCModal({ isOpen, onClose, onTalkToAgent }: { isOpen: boolean; onClose: () => void; onTalkToAgent?: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">Identity Verification</h2>
            <p className="text-sm text-slate-500">Required by financial regulations</p>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="flex justify-center mb-6">
              <ShieldCheck className="w-16 h-16 text-blue-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Let's verify your identity</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                To protect your account and comply with anti-money laundering laws, we need a photo of your government-issued ID and a quick selfie.
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Valid Driver's License or Passport
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Well-lit environment for a selfie
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Start Verification
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6 text-center">
            <h3 className="text-lg font-bold text-slate-900">Upload ID Document</h3>
            <p className="text-sm text-slate-500">Please provide a clear photo of your ID</p>

            <div className="grid grid-cols-2 gap-4">
              <button className="border-2 border-slate-200 border-dashed rounded-2xl p-6 hover:bg-slate-50 transition-colors group">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-3 group-hover:text-slate-900 transition-colors" />
                <div className="text-sm font-medium text-slate-900">Take Photo</div>
                <div className="text-xs text-slate-500 mt-1">Use device camera</div>
              </button>
              <button className="border-2 border-slate-200 border-dashed rounded-2xl p-6 hover:bg-slate-50 transition-colors group">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-3 group-hover:text-slate-900 transition-colors" />
                <div className="text-sm font-medium text-slate-900">Upload File</div>
                <div className="text-xs text-slate-500 mt-1">From your device</div>
              </button>
            </div>

            <button 
              onClick={() => {
                onClose();
                if (onTalkToAgent) {
                  onTalkToAgent();
                } else {
                  window.location.href = '/agents';
                }
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors mt-4"
            >
              Talk to an Agent for Verification
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
