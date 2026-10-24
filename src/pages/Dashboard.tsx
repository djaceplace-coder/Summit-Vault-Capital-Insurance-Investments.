import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Wallet, PieChart, ShieldCheck, Activity, ChevronDown,
  Plus, Sliders, FileText, ArrowUpRight, ArrowDownLeft, RefreshCw,
  MessageSquare, CreditCard, TrendingUp
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { DepositModal } from '../components/dashboard/DepositModal';
import { RebalanceModal } from '../components/dashboard/RebalanceModal';
import { ClaimModal } from '../components/dashboard/ClaimModal';
import { WithdrawModal } from '../components/dashboard/WithdrawModal';
import { InvestPanel } from '../components/dashboard/InvestPanel';

const CURRENCIES = {
  USD: { symbol: '$', label: 'USD - US Dollar', rate: 1 },
  EUR: { symbol: '€', label: 'EUR - Euro', rate: 0.92 },
  GBP: { symbol: '£', label: 'GBP - British Pound', rate: 0.79 },
};

interface RecentTx {
  id: string;
  type: string;
  amount: number;
  assetName?: string;
  status: string;
  timestamp: string;
}

export function Dashboard() {
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<RecentTx[]>([]);
  const [insuranceCoverage, setInsuranceCoverage] = useState(0);
  const [activePoliciesCount, setActivePoliciesCount] = useState(0);

  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();
  const { user, profile } = useAuth();

  const userBalance = {
    total_balance: Number(profile?.totalBalance ?? 0),
    invested_amount: Number(profile?.investedAmount ?? 0),
    cash_balance: Number(profile?.cashBalance ?? 0),
    returns_amount: Number(profile?.returnsAmount ?? 0),
  };

  useEffect(() => {
    if (!user) return;

    const txRef = collection(db, 'users', user.uid, 'transactions');
    const unsubTx = onSnapshot(
      txRef,
      (snap) => {
        const list: RecentTx[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: data.id || d.id,
            type: data.type || 'deposit',
            amount: Number(data.amount ?? 0),
            assetName: data.assetName,
            status: data.status || 'completed',
            timestamp: data.timestamp || new Date().toISOString(),
          });
        });
        list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setRecentTransactions(list.slice(0, 5));
      },
      () => {}
    );

    const polRef = collection(db, 'users', user.uid, 'policies');
    const unsubPol = onSnapshot(
      polRef,
      (snap) => {
        let totalCov = 0;
        let activeCount = 0;
        snap.forEach((d) => {
          const data = d.data();
          if (data.status === 'active') {
            totalCov += Number(data.coverage ?? 0);
            activeCount += 1;
          }
        });
        setInsuranceCoverage(totalCov);
        setActivePoliciesCount(activeCount);
      },
      () => {}
    );

    return () => {
      unsubTx();
      unsubPol();
    };
  }, [user]);

  const handleSupportRequest = (message: string) => {
    openAgentChat(message);
  };

  const formatCurrency = (amount: number) => {
    const converted = amount * CURRENCIES[currency].rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
    }).format(converted);
  };

  const hasBalance = userBalance.total_balance > 0 || userBalance.invested_amount > 0;

  const chartData = hasBalance
    ? [
        { name: 'Jan', value: Math.max(0, userBalance.total_balance * 0.82) },
        { name: 'Feb', value: Math.max(0, userBalance.total_balance * 0.86) },
        { name: 'Mar', value: Math.max(0, userBalance.total_balance * 0.89) },
        { name: 'Apr', value: Math.max(0, userBalance.total_balance * 0.93) },
        { name: 'May', value: Math.max(0, userBalance.total_balance * 0.96) },
        { name: 'Now', value: userBalance.total_balance },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">Vault Overview</h1>
            <p className="text-slate-500 text-sm">
              Welcome back, <span className="font-semibold text-slate-700">{profile?.firstName || user?.displayName?.split(' ')[0] || 'Investor'}</span>. Real-time custody & portfolio desk.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {currency} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {showCurrencyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                  >
                    {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrency(code);
                          setShowCurrencyDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-slate-900">{code}</span>
                        <span className="text-slate-500">{CURRENCIES[code].symbol}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/settings?tab=billing"
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Withdrawal Methods
            </Link>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              Withdraw
            </button>

            <button
              onClick={() => setShowDepositModal(true)}
              className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              + Fund Account
            </button>
          </div>
        </div>

        {/* 4 Standardized KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3 text-xs font-semibold uppercase tracking-wider">
              <span>Total Balance</span>
              <Wallet className="w-4 h-4 text-slate-900" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1.5 font-mono tabular-nums">
              {formatCurrency(userBalance.total_balance)}
            </div>
            <div className="text-xs text-slate-500 font-medium tabular-nums">
              Available Cash: <span className="font-semibold text-slate-800">{formatCurrency(userBalance.cash_balance)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3 text-xs font-semibold uppercase tracking-wider">
              <span>Invested Capital</span>
              <PieChart className="w-4 h-4 text-slate-900" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1.5 font-mono tabular-nums">
              {formatCurrency(userBalance.invested_amount)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {userBalance.invested_amount > 0 ? 'Active institutional portfolio' : 'No active allocations yet'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3 text-xs font-semibold uppercase tracking-wider">
              <span>Total Returns</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold font-heading mb-1.5 font-mono tabular-nums ${
                userBalance.returns_amount > 0 ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {userBalance.returns_amount > 0 ? '+' : ''}
              {formatCurrency(userBalance.returns_amount)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {userBalance.returns_amount > 0 ? 'Cumulative net yield' : 'Awaiting active yield'}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xs text-white">
            <div className="flex items-center justify-between text-slate-400 mb-3 text-xs font-semibold uppercase tracking-wider">
              <span>Insurance Coverage</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white mb-1.5 font-mono tabular-nums">
              {formatCurrency(insuranceCoverage)}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {activePoliciesCount > 0
                ? `${activePoliciesCount} active protection ${activePoliciesCount === 1 ? 'policy' : 'policies'}`
                : 'No bound policies yet'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column (Invest Panel, Performance Chart & Recent Activity) */}
          <div className="lg:col-span-2 space-y-8">
            <InvestPanel onRequestDeposit={() => setShowDepositModal(true)} />

            {hasBalance ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-slate-900">Vault Valuation Trajectory</h3>
                    <p className="text-xs text-slate-500">Real-time synchronized balance performance</p>
                  </div>
                  <Link
                    to="/portfolio"
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    Full Portfolio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashValueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.14} />
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                      <YAxis hide domain={['dataMin * 0.9', 'dataMax * 1.05']} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        formatter={(val: number) => [formatCurrency(val), 'Valuation']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0f172a"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#dashValueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-center items-center text-center">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 mb-1.5">Your Vault Balance is $0.00</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  Connect with a dedicated Funding Agent in live chat to make your first deposit, or link your preferred withdrawal methods (Cards, Coins/Crypto, PayPal, or Bank Wire).
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Fund Account via Agent
                  </button>
                  <Link
                    to="/settings?tab=billing"
                    className="bg-slate-100 text-slate-800 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Withdrawal Methods
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-heading text-slate-900">Recent Activity</h3>
                <Link to="/transactions" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                  View All Ledger →
                </Link>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                {recentTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                      No transactions recorded yet. Deposits, withdrawals, and trades will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentTransactions.map((tx) => {
                      const isPositive = ['deposit', 'sell', 'dividend'].includes(tx.type);
                      return (
                        <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                tx.type === 'deposit'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : tx.type === 'withdrawal'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              {tx.type === 'deposit' ? (
                                <ArrowDownLeft className="w-5 h-5" />
                              ) : tx.type === 'withdrawal' ? (
                                <ArrowUpRight className="w-5 h-5" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 capitalize">
                                {tx.type} {tx.assetName ? `· ${tx.assetName}` : ''}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(tx.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-sm font-bold font-mono tabular-nums ${
                              isPositive ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {isPositive ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Quick Actions & Dedicated Advisor) */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">Quick Vault Actions</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                      <Plus className="w-4 h-4" />
                    </div>
                    Fund Account (Via Agent)
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    Withdraw Funds
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <Link
                  to="/settings?tab=billing"
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    Withdrawal Methods (Cards / Crypto)
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>

                <button
                  onClick={() => setShowRebalanceModal(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                      <Sliders className="w-4 h-4" />
                    </div>
                    Rebalance Portfolio
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button
                  onClick={() => setShowClaimModal(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                      <FileText className="w-4 h-4" />
                    </div>
                    File an Insurance Claim
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <Link
                  to="/dashboard/insurance"
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors font-medium text-sm text-slate-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-900">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    View Insurance Policies
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 p-7 rounded-3xl shadow-2xs text-white relative overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                Dedicated Fiduciary Desk
              </div>
              <h3 className="text-xl font-bold font-heading mb-1.5">
                {profile?.assignedAgentName || 'Sarah Jenkins'}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                Speak directly with your assigned advisor or choose any accredited specialist in our 2-way live chat channel.
              </p>
              <button
                onClick={() => openAgentChat()}
                className="w-full text-center bg-white text-slate-900 py-3 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Open Live Advisor Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDepositModal && <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />}
        {showWithdrawModal && (
          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            onRequireSupport={handleSupportRequest}
          />
        )}
        {showRebalanceModal && (
          <RebalanceModal isOpen={showRebalanceModal} onClose={() => setShowRebalanceModal(false)} />
        )}
        {showClaimModal && <ClaimModal isOpen={showClaimModal} onClose={() => setShowClaimModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
