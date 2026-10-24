import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Wallet, PieChart, ShieldCheck, Activity, Bell, ChevronDown, Plus, Sliders, FileText, Download, ArrowUpRight, ArrowDownRight, MessageSquare } from 'lucide-react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { DepositModal } from '../components/dashboard/DepositModal';
import { RebalanceModal } from '../components/dashboard/RebalanceModal';
import { ClaimModal } from '../components/dashboard/ClaimModal';
import { KYCModal } from '../components/dashboard/KYCModal';
import { WithdrawModal } from '../components/dashboard/WithdrawModal';
import { InvestPanel } from '../components/dashboard/InvestPanel';

const CURRENCIES = {
  USD: { symbol: '$', label: 'USD - US Dollar' },
  EUR: { symbol: '€', label: 'EUR - Euro' },
  GBP: { symbol: '£', label: 'GBP - British Pound' },
};

export function Dashboard() {
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(() => {
    return localStorage.getItem('kyc_dismissed') !== 'true';
  });
  
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const userBalance = {
    total_balance: profile?.totalBalance ?? 145000,
    invested_amount: profile?.investedAmount ?? 95000,
    cash_balance: profile?.cashBalance ?? 50000,
    returns_amount: profile?.returnsAmount ?? 14200
  };


  const handleSupportRequest = (message: string) => {
    openAgentChat(message);
  };

  const handleLogout = () => {
    // Persistent session pattern: We do a hard clear and route to public
    // but in normal flows users don't need to log out
    navigate('/');
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {profile?.firstName || user?.displayName?.split(' ')[0] || 'Investor'}.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
              >
                {currency} <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <AnimatePresence>
                {showCurrencyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                  >
                    {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map((code) => (
                      <button
                        key={code}
                        onClick={() => { setCurrency(code); setShowCurrencyDropdown(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-900">{code}</span>
                        <span className="text-slate-500 text-sm">{CURRENCIES[code].symbol}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Withdraw
            </button>
            <button 
              onClick={() => setShowDepositModal(true)}
              className="bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              Fund Account
            </button>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 text-slate-600 mb-4 font-medium">
              <Wallet className="w-5 h-5 text-slate-900" /> Total Balance
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 mb-2">{formatCurrency(userBalance.total_balance)}</div>
            <div className="text-sm font-medium text-slate-500">
              Awaiting initial deposit
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 text-slate-600 mb-4 font-medium">
              <PieChart className="w-5 h-5 text-slate-900" /> Active Investments
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 mb-2">{formatCurrency(userBalance.invested_amount)}</div>
            <div className="text-sm text-slate-500 font-medium">
              No active portfolios yet
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm text-white"
          >
            <div className="flex items-center gap-3 text-slate-400 mb-4 font-medium">
              <ShieldCheck className="w-5 h-5 text-white" /> Insurance Coverage
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">{formatCurrency(userBalance.invested_amount)}</div>
            <div className="text-sm text-slate-400 font-medium">
              No active policies
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column (Chart & Activity) */}
          <div className="lg:col-span-2 space-y-8">

            <InvestPanel />

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-80 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">No Performance Data</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
                Fund your account and make your first investment to see your portfolio performance chart.
              </p>
              <button 
                onClick={() => setShowDepositModal(true)}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Make First Deposit
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">Recent Activity</h3>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 text-center">
                 <p className="text-slate-500 font-medium">You don't have any recent activity.</p>
              </div>
            </div>
          </div>

          {/* Right Column (Actions & Advisor) */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => openAgentChat('I would like to add investments from my balance fund account.')}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-slate-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                       <Plus className="w-4 h-4" />
                    </div>
                    Add Investments
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
                
                {/* Rebalance - shows up once they have portfolio. Kept here for demo flow */}
                <button 
                  onClick={() => setShowRebalanceModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-slate-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                       <Sliders className="w-4 h-4" />
                    </div>
                    Rebalance Portfolio
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button 
                  onClick={() => setShowClaimModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-slate-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                       <FileText className="w-4 h-4" />
                    </div>
                    File a Claim
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <Link to="/dashboard/insurance" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-slate-900 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-900">
                       <ShieldCheck className="w-4 h-4" />
                    </div>
                    View Insurance Policies
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl shadow-sm text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-xl font-bold font-heading mb-2">Need guidance?</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Connect with a dedicated advisor to help you optimize your initial strategy.
              </p>
              <button 
                onClick={() => openAgentChat()}
                className="w-full text-center bg-white text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Chat with Advisor
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Slide-overs and Modals */}
      <AnimatePresence>
        {showDepositModal && <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />}
        {showWithdrawModal && <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} onRequireSupport={handleSupportRequest} />}
        {showRebalanceModal && <RebalanceModal isOpen={showRebalanceModal} onClose={() => setShowRebalanceModal(false)} />}
        {showClaimModal && <ClaimModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} />}
        {showKYCModal && <KYCModal isOpen={showKYCModal} onClose={() => {
          localStorage.setItem('kyc_dismissed', 'true');
          setShowKYCModal(false);
        }} onTalkToAgent={() => {
          localStorage.setItem('kyc_dismissed', 'true');
          setShowKYCModal(false);
          openAgentChat();
        }} />}
      </AnimatePresence>
      
    </div>
  );
}
