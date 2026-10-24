import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../ui/Logo';
import {
  Search, LayoutDashboard, PieChart, ShieldCheck,
  ArrowLeftRight, MessageSquare, Settings, HelpCircle, LogOut,
  ChevronDown, ShieldAlert, CreditCard, Bell, Receipt, FileText, CheckCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AgentChatDrawer } from '../dashboard/AgentChatDrawer';
import { UserNotificationItem } from '../../pages/dashboard/Settings';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Insurance', href: '/dashboard/insurance', icon: ShieldCheck },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const QUICK_LINKS = [
  { label: 'Vault Overview & Balances', href: '/dashboard', keywords: 'dashboard balance deposit withdraw fund overview' },
  { label: 'Withdrawal Methods (Cards, Crypto, PayPal)', href: '/settings?tab=billing', keywords: 'card bank billing payment visa mastercard ach crypto paypal withdraw' },
  { label: 'Notifications & Account Alerts', href: '/settings?tab=notifications', keywords: 'notifications alerts invoice security unread' },
  { label: 'Portfolio & Asset Holdings', href: '/portfolio', keywords: 'portfolio holdings stocks crypto rebalance invest' },
  { label: 'Transactions & CSV Ledger', href: '/transactions', keywords: 'transactions history ledger csv deposit withdrawal' },
  { label: 'Insurance Policies & Claims', href: '/dashboard/insurance', keywords: 'insurance policy claim life health coverage' },
  { label: '2-Way Live Advisor Messages', href: '/messages', keywords: 'messages chat agent advisor support sarah' },
  { label: 'Profile & Security Settings', href: '/settings?tab=profile', keywords: 'settings profile password 2fa security phone' },
];

export function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState('');
  const [forcedAgentId, setForcedAgentId] = useState<string | undefined>(undefined);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const { user, profile, loading, signOut, isAdmin } = useAuth();

  // Listen for global 'svc:open-agent-chat' events (e.g. from DepositModal Funding Agent routing)
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ prefill?: string; agentId?: string }>;
      if (custom.detail?.prefill) {
        setChatPrefill(custom.detail.prefill);
      }
      if (custom.detail?.agentId) {
        setForcedAgentId(custom.detail.agentId);
      }
      setIsChatOpen(true);
    };
    window.addEventListener('svc:open-agent-chat', handler);
    return () => window.removeEventListener('svc:open-agent-chat', handler);
  }, []);

  // Real-time listener for unread chat messages
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'chats', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUnreadMessages(Number(snap.data()?.unreadByClient ?? 0));
        } else {
          setUnreadMessages(0);
        }
      },
      () => {}
    );
    return () => unsub();
  }, [user]);

  // Real-time listener for user notifications with zero-lag counter sync
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'notifications'),
      (snap) => {
        const list: UserNotificationItem[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as UserNotificationItem), id: d.id });
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setNotifications(list);

        const unreadCount = list.filter((n) => !n.read).length;
        const totalCount = list.length;
        if (
          profile &&
          (profile.unreadNotificationsCount !== unreadCount ||
            profile.totalNotificationsCount !== totalCount)
        ) {
          setDoc(
            doc(db, 'users', user.uid),
            {
              userId: user.uid,
              email: profile.email || user.email || '',
              unreadNotificationsCount: unreadCount,
              totalNotificationsCount: totalCount,
            },
            { merge: true }
          ).catch(() => {});
        }
      },
      () => {}
    );
    return () => unsub();
  }, [user, profile?.unreadNotificationsCount, profile?.totalNotificationsCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <div className="absolute">
            <Logo showWordmark={false} dark />
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.24em] font-semibold text-amber-300">Accessing Vault Custody...</p>
        <p className="text-xs text-slate-500 mt-1.5">Validating secure session credentials</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const openAgentChat = (prefill: string = '', agentId?: string) => {
    setChatPrefill(prefill);
    if (agentId) setForcedAgentId(agentId);
    setIsChatOpen(true);
  };

  const handleNotificationClick = async (notif: UserNotificationItem) => {
    if (!notif.read && user) {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notif.id), {
        read: true,
        readAt: new Date().toISOString(),
      }).catch(() => {});
    }
    setNotifDropdownOpen(false);
    if (notif.requiresChatOpen || notif.category === 'account_alert' || notif.category === 'invoice') {
      const prefill = notif.referenceCode
        ? `Regarding ${notif.title} (Ref: ${notif.referenceCode}): `
        : `Regarding ${notif.title}: `;
      openAgentChat(prefill);
    } else {
      navigate('/settings?tab=notifications');
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    const unreadList = notifications.filter((n) => !n.read);
    const now = new Date().toISOString();
    await Promise.all(
      unreadList.map((n) =>
        updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), {
          read: true,
          readAt: now,
        }).catch(() => {})
      )
    );
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const searchResults = searchQuery.trim()
    ? QUICK_LINKS.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white fixed inset-y-0 z-40">
        <div className="h-[72px] flex items-center px-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Messages' && unreadMessages > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
                    {unreadMessages}
                  </span>
                )}
                {item.name === 'Settings' && unreadNotifications > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
            <Link
              to="/settings?tab=billing"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span>Withdrawal Methods</span>
            </Link>
            <Link
              to="/settings?tab=notifications"
              className="flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Notifications</span>
              </div>
              {unreadNotifications > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer relative"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Live Advisor Chat</span>
            {unreadMessages > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full font-mono tabular-nums">
                {unreadMessages}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Responsive Top Header (Mobile + Desktop) */}
        <header className="h-[68px] sm:h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <Link to="/dashboard" className="flex items-center">
              <Logo />
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 max-w-xl pr-8 relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to withdrawal methods, notifications, portfolio, policies, or advisor chat..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
              {searchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 py-1.5">
                  {searchResults.map((res) => (
                    <button
                      key={res.href}
                      type="button"
                      onClick={() => {
                        navigate(res.href);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between cursor-pointer"
                    >
                      <span>{res.label}</span>
                      <span className="text-[11px] text-slate-400">Open →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Real-Time Notifications Bell & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer relative"
                title="Account Notifications & Alerts"
              >
                <Bell className={`w-4 h-4 ${unreadNotifications > 0 ? 'text-amber-600' : 'text-slate-600'}`} />
                <span className="hidden md:inline">Notifications</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full font-mono tabular-nums ${
                    unreadNotifications > 0
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {unreadNotifications}
                </span>
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
                        <div>
                          <div className="text-xs font-bold flex items-center gap-2">
                            <span>Vault Notifications</span>
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500 text-slate-950 font-mono tabular-nums">
                              {unreadNotifications} Unread
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                            {notifications.length - unreadNotifications} Read · {notifications.length} Total
                          </div>
                        </div>
                        {unreadNotifications > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            No notifications yet. Official alerts and invoices will appear here in real time.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => {
                            const isAlert = n.category === 'account_alert' || n.category === 'security';
                            const isInvoice = n.category === 'invoice';
                            return (
                              <button
                                key={n.id}
                                type="button"
                                onClick={() => handleNotificationClick(n)}
                                className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                                  !n.read ? 'bg-amber-50/40' : ''
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                    isAlert
                                      ? 'bg-red-100 text-red-700'
                                      : isInvoice
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-900 text-amber-400'
                                  }`}
                                >
                                  {isInvoice ? (
                                    <Receipt className="w-4 h-4" />
                                  ) : isAlert ? (
                                    <ShieldAlert className="w-4 h-4" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-900 text-xs truncate">
                                      {n.title}
                                    </span>
                                    {!n.read && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                                    {n.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                                    <span className="tabular-nums">
                                      {new Date(n.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                    {(n.requiresChatOpen || isAlert || isInvoice) && (
                                      <span className="font-semibold text-amber-700">
                                        Open Personal Chat →
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="p-2.5 border-t border-slate-100 bg-slate-50">
                        <Link
                          to="/settings?tab=notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="block w-full text-center py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                        >
                          Manage All Notifications ({notifications.length})
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer relative"
            >
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Advisor Chat</span>
              {unreadMessages > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
                  {unreadMessages}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm border border-slate-200 shadow-2xs">
                  {profile?.firstName?.[0] || user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {profile?.firstName
                              ? `${profile.firstName} ${profile.lastName || ''}`.trim()
                              : user?.displayName || 'Client Account'}
                          </p>
                          {isAdmin && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="py-1.5">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            <ShieldAlert className="w-4 h-4" /> Admin Center
                          </Link>
                        )}
                        <Link
                          to="/settings?tab=profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Settings className="w-4 h-4" /> Profile & Settings
                        </Link>
                        <Link
                          to="/settings?tab=billing"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <CreditCard className="w-4 h-4" /> Withdrawal Methods
                        </Link>
                        <Link
                          to="/settings?tab=notifications"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <span className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4" /> Notifications
                          </span>
                          {unreadNotifications > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
                              {unreadNotifications}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/learn"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <HelpCircle className="w-4 h-4" /> Knowledge Base
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 relative pb-20 lg:pb-8">
          <Outlet context={{ openAgentChat }} />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe">
        <div className="flex items-center justify-around px-1 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.name}</span>
                {item.name === 'Messages' && unreadMessages > 0 && (
                  <span className="absolute top-1.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
                {item.name === 'Settings' && unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatPrefill('');
          setForcedAgentId(undefined);
        }}
        prefilledMessage={chatPrefill}
        forcedAgentId={forcedAgentId}
      />
    </div>
  );
}
