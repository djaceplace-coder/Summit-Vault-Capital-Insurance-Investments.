import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Shield, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../lib/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open to prevent background jitter
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Products', href: '/products', hasDropdown: true },
    { name: 'Insurance', href: '/insurance', hasDropdown: true },
    { name: 'Agents', href: '/agents' },
    { name: 'Learn', href: '/learn' },
    { name: 'About', href: '/about' },
    { name: 'For Business', href: '/for-business' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        mobileMenuOpen
          ? 'bg-slate-950 border-b border-slate-800 py-3.5'
          : isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3'
          : 'bg-white/60 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none py-4 sm:py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Logo with Balanced Right Spacing */}
          <Link to="/" className="flex items-center group z-50 mr-4 sm:mr-6 lg:mr-12 flex-shrink-0">
            <Logo dark={mobileMenuOpen} />
          </Link>

          {/* Desktop Nav with Refined Spacing */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors flex items-center gap-1 group py-1"
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 ml-6 xl:ml-8">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center gap-2 border border-slate-800"
              >
                <User className="w-4 h-4 text-amber-400" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md active:scale-95 border border-slate-800 flex items-center gap-1.5"
                >
                  <span>Open Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && (
              <Link
                to="/dashboard"
                className="p-2 text-xs font-semibold bg-amber-500/10 text-amber-700 rounded-lg border border-amber-500/30 flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" /> Portal
              </Link>
            )}
            <button
              className={cn(
                "p-2.5 rounded-xl transition-colors z-50 relative focus:outline-hidden",
                mobileMenuOpen ? "text-white hover:bg-slate-800" : "text-slate-900 hover:bg-slate-100"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[60px] sm:top-[68px] bg-slate-950/98 backdrop-blur-xl z-40 lg:hidden overflow-y-auto flex flex-col"
          >
            <div className="px-6 py-6 flex flex-col flex-1 max-w-md mx-auto w-full justify-between">
              <motion.div 
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06 }
                  }
                }}
                className="flex flex-col gap-2 pt-2"
              >
                <span className="text-[11px] font-semibold tracking-[0.2em] text-amber-400 uppercase mb-2">
                  Navigation Sectors
                </span>

                {navLinks.map((link) => (
                  <motion.div 
                    key={link.name}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0 }
                    }}
                  >
                    <Link
                      to={link.href}
                      className="text-2xl font-heading font-medium text-white hover:text-amber-300 flex justify-between items-center py-3 border-b border-slate-900 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{link.name}</span>
                      {link.hasDropdown && <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              
              <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-3 pb-8">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="w-full text-center py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-950/40"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Enter Client Vault
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="w-full text-center py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Open Vault</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full text-center py-3.5 text-white font-semibold rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Client Log In
                    </Link>
                  </>
                )}
                <div className="text-center text-[11px] text-slate-500 mt-2">
                  Summit Vault Capital · Segregated Institutional Custody
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
