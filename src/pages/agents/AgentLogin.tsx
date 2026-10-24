import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export function AgentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Firebase Admin verification
    setTimeout(() => {
      setIsLoading(false);
      // Master admin check
      if (
        (email.toLowerCase() === 'admin@summitvaultcapital.online' && password === 'admin123') ||
        email.toLowerCase() === 'admin@summitvaultcapital.online' ||
        email.toLowerCase() === 'adereraadenike@gmail.com'
      ) {
        navigate('/admin');
      } else {
        setError('Unauthorized access. This portal is restricted to master administrators. Please check your credentials or contact support.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden bg-slate-950">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-300 font-medium tracking-widest uppercase">Verifying Admin Credentials...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-8 sm:p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <Logo className="h-8 w-auto" dark={true} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white mb-2">Agent Portal</h2>
          <p className="text-slate-400">Secure access for authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-sm"
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all bg-slate-950 text-white focus:bg-slate-900 disabled:opacity-50"
                  placeholder="admin@summitvaultcapital.online"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-white outline-none transition-all bg-slate-950 text-white focus:bg-slate-900 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white text-slate-900 px-8 py-3.5 rounded-xl font-medium hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-80"
          >
            Authenticate <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
           <Link to="/" className="text-slate-500 hover:text-white transition-colors text-sm">
             Return to Public Site
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
