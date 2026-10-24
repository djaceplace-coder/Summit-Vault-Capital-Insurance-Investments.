import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../ui/Logo';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with Balanced Right Spacing */}
          <Link to="/" className="flex items-center group z-50 mr-6 lg:mr-14 flex-shrink-0">
            <Logo dark={mobileMenuOpen} />
          </Link>

          {/* Desktop Nav with Refined Spacing */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 group"
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions with Generous Spacing */}
          <div className="hidden lg:flex items-center gap-4 ml-6 xl:ml-10">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 border border-slate-800"
            >
              Open Vault
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-slate-900" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[72px] bg-slate-900 z-40 lg:hidden overflow-y-auto"
          >
            <div className="px-6 py-8 flex flex-col min-h-full">
              <motion.div 
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="flex flex-col gap-6"
              >
                {navLinks.map((link) => (
                  <motion.div 
                    key={link.name}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                  >
                    <Link
                      to={link.href}
                      className="text-3xl font-heading font-medium text-white flex justify-between items-center py-2 border-b border-slate-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                      {link.hasDropdown && <ChevronDown className="w-6 h-6 text-slate-500" />}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pt-12 flex flex-col gap-4 pb-12"
              >
                <Link
                  to="/login"
                  className="text-center py-4 text-white font-medium rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-center py-4 bg-white text-slate-900 font-medium rounded-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
