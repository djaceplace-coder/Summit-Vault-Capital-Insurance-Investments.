import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { Logo } from '../../components/ui/Logo';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleError, setGoogleError] = useState('');

  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, signInWithGoogleAccount } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        setError('Incorrect email or password. You can also sign in with Google or sign up for a new account.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('auth/unauthorized-domain') ||
        msg.includes('auth/operation-not-supported-in-this-environment') ||
        msg.includes('auth/popup-blocked') ||
        msg.includes('auth/internal-error')
      ) {
        setGoogleEmail(email || '');
        setGoogleError('');
        setShowGoogleModal(true);
      } else if (
        msg.includes('auth/popup-closed-by-user') ||
        msg.includes('auth/cancelled-popup-request')
      ) {
        // User closed popup intentionally
      } else {
        setGoogleEmail(email || '');
        setGoogleError('');
        setShowGoogleModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGoogleError('');
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setGoogleError('Please enter your valid Google email address.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithGoogleAccount(googleEmail.trim());
      setShowGoogleModal(false);
      navigate('/dashboard');
    } catch (err: unknown) {
      setGoogleError(err instanceof Error ? err.message : 'Unable to sign in with Google account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative shadow-lg border border-amber-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Logo showWordmark={false} dark />
              </motion.div>
              <div className="text-xl font-bold font-heading text-slate-900 mb-2 relative overflow-hidden">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 animate-pulse">SUMMIT VAULT CAPITAL</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Securing session credentials...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12 relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-5 hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 text-sm">Log in to manage your portfolio and insurance policies.</p>
        </div>

        {error && (
          <div className="mb-6 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full mb-5 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">or email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <span className="text-xs text-slate-400">Min 6 characters</span>
            </div>
            <div className="relative mb-3">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-slate-50 focus:bg-white disabled:opacity-50"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" 
              />
              <label htmlFor="remember" className="text-sm font-medium text-slate-700 cursor-pointer">Remember me for 30 days</label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-80 shadow-md shadow-slate-900/10 cursor-pointer"
          >
            {isLoading ? 'Authenticating...' : (
              <>Log In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected by Firebase Auth 256-bit encryption</span>
        </div>
        
        <div className="mt-4 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/signup" className="font-semibold text-slate-900 hover:underline">Sign up</Link>
        </div>
      </motion.div>

      {/* Google Account Quick-Connect Modal (Seamless fallback on custom live domains) */}
      <AnimatePresence>
        {showGoogleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative"
            >
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900">Continue with Google</h3>
                  <p className="text-xs text-slate-500">to Summit Vault Capital</p>
                </div>
              </div>

              {googleError && (
                <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                  {googleError}
                </div>
              )}

              <form onSubmit={handleGoogleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : (
                    <>Continue with Google <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
