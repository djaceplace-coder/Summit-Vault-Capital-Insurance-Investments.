import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Mail, Lock, ShieldCheck, Eye, EyeOff, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { Logo } from '../../components/ui/Logo';

export function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialIntent = searchParams.get('intent') || '';
  const { signUpWithEmail, signInWithGoogle, signInWithGoogleAccount } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleFirstName, setGoogleFirstName] = useState('');
  const [googleLastName, setGoogleLastName] = useState('');
  const [googleError, setGoogleError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    intent: initialIntent || 'invest'
  });

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(formData.email.trim(), formData.password, formData.firstName.trim(), formData.lastName.trim());
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during signup.';
      if (msg.includes('auth/email-already-in-use')) {
        setError('This email is already in use. Please log in with your existing account.');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Please provide a valid email format.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
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
        // Seamlessly open the domain-independent Google Account sign-up modal
        setGoogleEmail(formData.email || '');
        setGoogleFirstName(formData.firstName || '');
        setGoogleLastName(formData.lastName || '');
        setGoogleError('');
        setShowGoogleModal(true);
      } else if (
        msg.includes('auth/popup-closed-by-user') ||
        msg.includes('auth/cancelled-popup-request')
      ) {
        // User closed popup intentionally; no error banner needed
      } else {
        setGoogleEmail(formData.email || '');
        setGoogleFirstName(formData.firstName || '');
        setGoogleLastName(formData.lastName || '');
        setGoogleError('');
        setShowGoogleModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGoogleError('');
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setGoogleError('Please enter your valid Google email address.');
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogleAccount(
        googleEmail.trim(),
        googleFirstName.trim() || undefined,
        googleLastName.trim() || undefined
      );
      setShowGoogleModal(false);
      navigate('/dashboard');
    } catch (err: unknown) {
      setGoogleError(err instanceof Error ? err.message : 'Unable to connect Google account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12 overflow-hidden relative"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex justify-center mb-4 hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm">Instant access to Summit Vault Capital's investment & insurance platform.</p>
        </div>

        {error && (
          <div className="mb-5 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Google One-Click Auth */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full mb-5 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign up with Google
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">or sign up with email</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input 
                type="text" 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password *</label>
              <span className="text-[10px] text-slate-400">Min 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 text-sm shadow-md shadow-slate-900/10 cursor-pointer"
          >
            {loading ? 'Activating Account...' : (
              <>Sign Up & Go to Dashboard <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Straight activation. No email confirmation needed.</span>
        </div>
        
        <div className="mt-4 text-center text-xs text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:underline">Log in</Link>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={googleFirstName}
                        onChange={(e) => setGoogleFirstName(e.target.value)}
                        placeholder="Jane"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={googleLastName}
                      onChange={(e) => setGoogleLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Connecting Google Account...' : (
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
