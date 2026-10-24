import { useState, useEffect, ReactNode, FormEvent } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lock, Shield, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Link } from 'react-router-dom';

const ADMIN_SESSION_KEY = 'svc_admin_unlocked_v1';

export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [expectedPasscode, setExpectedPasscode] = useState<string>('909090');
  const [inputCode, setInputCode] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  useEffect(() => {
    const configRef = doc(db, 'system', 'adminConfig');

    const unsub = onSnapshot(
      configRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.passcode) {
            setExpectedPasscode(String(data.passcode));
          }
        } else {
          // Initialize default passcode '909090' in Firestore
          try {
            await setDoc(configRef, {
              passcode: '909090',
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.warn('Default adminConfig fallback:', e);
          }
          setExpectedPasscode('909090');
        }
        setLoadingConfig(false);
      },
      (err) => {
        console.warn('Admin config listener fallback:', err);
        setExpectedPasscode('909090');
        setLoadingConfig(false);
      }
    );

    return () => unsub();
  }, []);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = inputCode.trim();

    // Check against live Firestore passcode (or default '909090' if not yet synced)
    try {
      const snap = await getDoc(doc(db, 'system', 'adminConfig'));
      const currentPass = snap.exists() && snap.data()?.passcode ? String(snap.data().passcode) : expectedPasscode;
      if (trimmed === currentPass) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setUnlocked(true);
        return;
      }
    } catch {
      if (trimmed === expectedPasscode) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setUnlocked(true);
        return;
      }
    }

    setError('Invalid Master Admin passcode. Access denied.');
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-5 sm:p-8 relative overflow-hidden">
      {/* Ambient Vault Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between max-w-7xl w-full mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center">
          <Logo dark />
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors"
        >
          Exit to Depository
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-auto relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-6 shadow-lg shadow-amber-950/30">
            <Shield className="w-7 h-7" />
          </div>

          <div className="text-center mb-8">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 mb-2">
              Restricted Fiduciary Sector
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Master Admin Command
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Enter your Master Security Passcode to unlock full account, balance, and live client chat privileges.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Admin Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showCode ? 'text' : 'password'}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Enter passcode..."
                  autoFocus
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl text-white tracking-widest font-mono text-base focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingConfig || !inputCode.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Unlock Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 relative z-10">
        Summit Vault Capital · Encrypted Master Governance Protocol
      </div>
    </div>
  );
}

export function lockAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
