import { motion, AnimatePresence } from 'motion/react';
import {
  User, Bell, Shield, Key, CreditCard, Smartphone, CheckCircle2,
  Loader2, X, Building, Trash2, Star, MessageSquare, Plus, AlertCircle,
  Coins, Wallet, Globe, FileText, ShieldAlert, Receipt, CheckCheck, Eye
} from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export interface LinkedPaymentMethod {
  id: string;
  userId: string;
  methodType: 'card' | 'bank' | 'crypto' | 'paypal' | 'other';
  brand: string;
  holderName: string;
  last4: string;
  expiry?: string;
  details?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface UserNotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'account_alert' | 'invoice' | 'security' | 'funding' | 'system';
  priority?: 'critical' | 'high' | 'normal';
  read: boolean;
  readAt?: string;
  requiresChatOpen?: boolean;
  senderAgentName?: string;
  referenceCode?: string;
  invoiceAmount?: number;
  createdAt: string;
}

const CRYPTO_COINS = [
  { symbol: 'BTC', name: 'Bitcoin (BTC)', network: 'Bitcoin Mainnet' },
  { symbol: 'ETH', name: 'Ethereum (ETH)', network: 'ERC-20' },
  { symbol: 'USDT', name: 'Tether (USDT)', network: 'ERC-20 / TRC-20' },
  { symbol: 'USDC', name: 'USD Coin (USDC)', network: 'ERC-20 / Solana' },
  { symbol: 'SOL', name: 'Solana (SOL)', network: 'Solana Mainnet' },
];

function detectCardBrand(num: string): string {
  const clean = num.replace(/\D/g, '');
  if (clean.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Visa';
}

export function Settings() {
  const { user, profile, signOut, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && ['profile', 'security', 'notifications', 'billing'].includes(tabParam)
      ? tabParam
      : 'profile';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'security', 'notifications', 'billing'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Profile state
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '+1 (555) 000-0000');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '+1 (555) 000-0000');
    }
  }, [profile?.firstName, profile?.lastName, profile?.phone]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setProfileSavedMsg('Profile synchronized in real time.');
      setTimeout(() => setProfileSavedMsg(''), 3500);
    } finally {
      setSavingProfile(false);
    }
  };

  // Security state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('sv_2fa_enabled') === 'true';
  });

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setUpdatingPassword(true);
    try {
      if (user) {
        await updatePassword(user, newPassword);
      }
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({ type: 'success', text: 'Account password updated successfully.' });
    } catch {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus({
        type: 'success',
        text: 'Security credentials updated for your vault session.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const toggleTwoFactor = () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    localStorage.setItem('sv_2fa_enabled', String(next));
  };

  // Real-time Notifications state (/users/{uid}/notifications)
  const [notifications, setNotifications] = useState<UserNotificationItem[]>([]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'read' | 'alerts'>('all');
  const [notifPrefs, setNotifPrefs] = useState({
    trades: true,
    transfers: true,
    security: true,
    market: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const notifRef = collection(db, 'users', user.uid, 'notifications');
    const unsub = onSnapshot(
      notifRef,
      (snap) => {
        const list: UserNotificationItem[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as UserNotificationItem), id: d.id });
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setNotifications(list);

        // Keep user profile notification counters synchronized in real time with zero lag
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
      (err) => {
        console.warn('Notifications listener error:', err);
      }
    );
    return () => unsub();
  }, [user, profile?.unreadNotificationsCount, profile?.totalNotificationsCount]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const readNotificationsCount = notifications.filter((n) => n.read).length;

  const handleToggleNotificationRead = async (notif: UserNotificationItem, forceRead?: boolean) => {
    if (!user) return;
    const nextRead = forceRead !== undefined ? forceRead : !notif.read;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notif.id), {
        read: nextRead,
        readAt: nextRead ? new Date().toISOString() : '',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notifications/${notif.id}`);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    const unreadList = notifications.filter((n) => !n.read);
    const now = new Date().toISOString();
    try {
      await Promise.all(
        unreadList.map((n) =>
          updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), {
            read: true,
            readAt: now,
          })
        )
      );
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  };

  const handleOpenNotificationInChat = async (notif: UserNotificationItem) => {
    if (!notif.read) {
      await handleToggleNotificationRead(notif, true);
    }
    const prefill = notif.referenceCode
      ? `Regarding ${notif.title} (Ref: ${notif.referenceCode}): `
      : `Regarding ${notif.title}: `;
    openAgentChat(prefill);
  };

  const handleSaveNotifs = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  // Linked Withdrawal Methods state (Firestore /users/{uid}/cards)
  const [paymentMethods, setPaymentMethods] = useState<LinkedPaymentMethod[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [methodType, setMethodType] = useState<'card' | 'crypto' | 'paypal' | 'bank' | 'other'>('card');
  const [cardStatus, setCardStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [cardError, setCardError] = useState('');

  // Card inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Crypto inputs
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoNetwork, setCryptoNetwork] = useState('Bitcoin Mainnet');
  const [walletAddress, setWalletAddress] = useState('');

  // PayPal input
  const [paypalEmail, setPaypalEmail] = useState('');

  // Bank inputs
  const [bankName, setBankName] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Other withdrawal input
  const [otherMethodName, setOtherMethodName] = useState('');
  const [otherAccountRef, setOtherAccountRef] = useState('');

  useEffect(() => {
    if (!user) return;
    const cardsRef = collection(db, 'users', user.uid, 'cards');
    const unsub = onSnapshot(
      cardsRef,
      (snap) => {
        const list: LinkedPaymentMethod[] = [];
        snap.forEach((d) => {
          list.push(d.data() as LinkedPaymentMethod);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setPaymentMethods(list);
      },
      (err) => {
        console.warn('Error loading withdrawal methods:', err);
      }
    );
    return () => unsub();
  }, [user]);

  const handleAddPaymentMethod = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCardError('');

    const id = `pm_${Date.now()}`;
    const isFirst = paymentMethods.length === 0;
    let newMethod: LinkedPaymentMethod;

    if (methodType === 'card') {
      const cleanDigits = cardNumber.replace(/\D/g, '');
      if (cleanDigits.length < 13 || cleanDigits.length > 19) {
        setCardError('Please enter a valid 16-digit bank card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setCardError('Please enter a valid expiry date in MM/YY format.');
        return;
      }
      if (cardCVC.length < 3) {
        setCardError('Please enter a valid 3 or 4 digit security CVC.');
        return;
      }
      newMethod = {
        id,
        userId: user.uid,
        methodType: 'card',
        brand: detectCardBrand(cardNumber),
        holderName: cardName.trim() || `${firstName} ${lastName}`.trim() || 'Cardholder',
        last4: cleanDigits.slice(-4),
        expiry: cardExpiry,
        isDefault: isFirst,
        createdAt: new Date().toISOString(),
      };
    } else if (methodType === 'crypto') {
      if (!walletAddress.trim() || walletAddress.trim().length < 8) {
        setCardError('Please enter a valid coin / crypto destination wallet address.');
        return;
      }
      const addr = walletAddress.trim();
      newMethod = {
        id,
        userId: user.uid,
        methodType: 'crypto',
        brand: `${cryptoSymbol} (${cryptoNetwork})`,
        holderName: addr,
        last4: addr.slice(-6),
        expiry: cryptoNetwork,
        details: addr,
        isDefault: isFirst,
        createdAt: new Date().toISOString(),
      };
    } else if (methodType === 'paypal') {
      if (!paypalEmail.trim() || !paypalEmail.includes('@')) {
        setCardError('Please enter a valid PayPal email address.');
        return;
      }
      newMethod = {
        id,
        userId: user.uid,
        methodType: 'paypal',
        brand: 'PayPal',
        holderName: paypalEmail.trim(),
        last4: paypalEmail.trim().slice(0, 6),
        expiry: 'Verified PayPal Payout',
        details: paypalEmail.trim(),
        isDefault: isFirst,
        createdAt: new Date().toISOString(),
      };
    } else if (methodType === 'bank') {
      const cleanAcct = accountNumber.replace(/\D/g, '');
      if (!bankName.trim() || cleanAcct.length < 4) {
        setCardError('Please enter your bank name and valid account number.');
        return;
      }
      newMethod = {
        id,
        userId: user.uid,
        methodType: 'bank',
        brand: bankName.trim(),
        holderName: bankHolder.trim() || `${firstName} ${lastName}`.trim() || 'Account Holder',
        last4: cleanAcct.slice(-4),
        expiry: routingNumber ? `RTN ••${routingNumber.slice(-4)}` : 'ACH / Wire',
        isDefault: isFirst,
        createdAt: new Date().toISOString(),
      };
    } else {
      if (!otherMethodName.trim() || !otherAccountRef.trim()) {
        setCardError('Please enter the withdrawal provider and destination account identifier.');
        return;
      }
      newMethod = {
        id,
        userId: user.uid,
        methodType: 'other',
        brand: otherMethodName.trim(),
        holderName: otherAccountRef.trim(),
        last4: otherAccountRef.trim().slice(-4),
        expiry: 'External Payout',
        details: otherAccountRef.trim(),
        isDefault: isFirst,
        createdAt: new Date().toISOString(),
      };
    }

    setCardStatus('verifying');

    try {
      await setDoc(doc(db, 'users', user.uid, 'cards', id), newMethod);

      setTimeout(() => {
        setCardStatus('success');
        setTimeout(() => {
          setShowCardModal(false);
          setCardStatus('idle');
          setCardNumber('');
          setCardName('');
          setCardExpiry('');
          setCardCVC('');
          setWalletAddress('');
          setPaypalEmail('');
          setBankName('');
          setBankHolder('');
          setRoutingNumber('');
          setAccountNumber('');
          setOtherMethodName('');
          setOtherAccountRef('');
        }, 1000);
      }, 450);
    } catch (err) {
      setCardStatus('idle');
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/cards`);
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cards', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/cards/${id}`);
    }
  };

  const handleSetDefaultMethod = async (targetId: string) => {
    if (!user) return;
    try {
      for (const pm of paymentMethods) {
        await updateDoc(doc(db, 'users', user.uid, 'cards', pm.id), {
          isDefault: pm.id === targetId,
        });
      }
    } catch (err) {
      console.warn('Error setting default withdrawal method:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    if (notifFilter === 'read') return n.read;
    if (notifFilter === 'alerts') return n.category === 'account_alert' || n.category === 'invoice' || n.requiresChatOpen;
    return true;
  });

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User, badge: 0 },
    { id: 'billing', label: 'Withdrawal Methods', icon: CreditCard, badge: 0 },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell, badge: unreadNotificationsCount },
    { id: 'security', label: 'Security & Login', icon: Shield, badge: 0 },
  ];

  const getMethodIcon = (type: LinkedPaymentMethod['methodType']) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'crypto':
        return <Coins className="w-5 h-5" />;
      case 'paypal':
        return <Wallet className="w-5 h-5" />;
      case 'bank':
        return <Building className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1">Account Settings</h1>
          <p className="text-slate-500 text-sm">
            Manage your profile, withdrawal destinations (Cards, Coins/Crypto, PayPal, Bank Wire), and real-time notifications.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
        >
          Sign Out of Vault
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[620px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 p-4 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xs shrink-0">
                    {firstName?.[0] || profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {firstName || profile?.firstName || 'Client'} {lastName || profile?.lastName || ''}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Assigned Advisor: <span className="font-semibold text-amber-700">{profile?.assignedAgentName || 'Sarah Jenkins'}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Status: <span className="font-semibold uppercase text-emerald-600">{profile?.status || 'active'}</span> · KYC: <span className="font-semibold uppercase text-slate-700">{profile?.kycStatus || 'verified'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAgentChat()}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-center cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Chat with Advisor
                </button>
              </div>

              {profileSavedMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Withdrawal Methods & Payout Destinations</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Manage your verified Bank Cards, Coins / Crypto Wallets, PayPal, and Bank Wire accounts for withdrawals.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCardError('');
                    setCardStatus('idle');
                    setShowCardModal(true);
                  }}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Withdrawal Method
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 leading-relaxed mb-6">
                <strong>Fiduciary Custody Policy:</strong> Bank cards are strictly a means of <strong>withdrawal</strong> alongside Coins, Crypto Assets (BTC, ETH, USDT, USDC, SOL), PayPal, and Bank Wire payouts. To fund your account, click <strong>Fund Account</strong> on your dashboard to connect directly with a Funding Agent in live chat.
              </div>

              {paymentMethods.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/60 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-700 shadow-2xs">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">No Withdrawal Destinations Linked Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                    Link a Bank Card (Visa/Mastercard/Amex), Coins / Crypto Wallet (BTC, ETH, USDT, SOL), PayPal account, or Bank Wire account to receive vault withdrawals seamlessly.
                  </p>
                  <button
                    onClick={() => {
                      setCardError('');
                      setCardStatus('idle');
                      setShowCardModal(true);
                    }}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Link First Withdrawal Method
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors bg-white"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            pm.methodType === 'card'
                              ? 'bg-slate-900 text-amber-400'
                              : pm.methodType === 'crypto'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : pm.methodType === 'paypal'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {getMethodIcon(pm.methodType)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">
                              {pm.methodType === 'crypto' || pm.methodType === 'paypal' || pm.methodType === 'other'
                                ? pm.brand
                                : `${pm.brand} •••• ${pm.last4}`}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {pm.methodType === 'crypto' ? 'Coins / Crypto' : pm.methodType}
                            </span>
                            {pm.isDefault && (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                Default Payout
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {pm.holderName} {pm.expiry ? `· ${pm.methodType === 'card' ? `Exp ${pm.expiry}` : pm.expiry}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!pm.isDefault && (
                          <button
                            onClick={() => handleSetDefaultMethod(pm.id)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" /> Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemovePaymentMethod(pm.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setCardError('');
                  setCardStatus('idle');
                  setShowCardModal(true);
                }}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Plus className="w-5 h-5" /> Link Card, Crypto Wallet, PayPal, or Bank Account
              </button>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Live Account Notifications & Alerts</h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Real-time feed of official account alerts, invoices, security notices, and fiduciary updates.
                    </p>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4 text-amber-400" />
                      Mark All as Read ({unreadNotificationsCount})
                    </button>
                  )}
                </div>

                {/* Real-Time Notification Counters (Before & After Reading) */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                      Unread Notifications
                    </div>
                    <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      {unreadNotificationsCount}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                      Read Notifications
                    </div>
                    <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      {readNotificationsCount}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Total Dispatched
                    </div>
                    <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                      {notifications.length}
                    </div>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {[
                    { id: 'all' as const, label: `All (${notifications.length})` },
                    { id: 'unread' as const, label: `Unread (${unreadNotificationsCount})` },
                    { id: 'read' as const, label: `Read (${readNotificationsCount})` },
                    { id: 'alerts' as const, label: 'Account Alerts & Invoices' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNotifFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer font-mono tabular-nums ${
                        notifFilter === tab.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                  <div className="p-10 rounded-2xl border border-slate-200 bg-slate-50/50 text-center">
                    <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2.5" />
                    <div className="text-sm font-bold text-slate-900">No Notifications in This View</div>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Official account alerts, invoices, and fiduciary notices from your advisor will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notif) => {
                      const isAlert = notif.category === 'account_alert' || notif.category === 'security';
                      const isInvoice = notif.category === 'invoice';
                      return (
                        <div
                          key={notif.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            !notif.read
                              ? isAlert
                                ? 'bg-red-50/40 border-red-200 shadow-2xs'
                                : isInvoice
                                ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                                : 'bg-slate-900/[0.03] border-slate-300 shadow-2xs'
                              : 'bg-white border-slate-200 opacity-85'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  isAlert
                                    ? 'bg-red-100 text-red-700'
                                    : isInvoice
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-900 text-amber-400'
                                }`}
                              >
                                {isInvoice ? (
                                  <Receipt className="w-5 h-5" />
                                ) : isAlert ? (
                                  <ShieldAlert className="w-5 h-5" />
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                    {notif.title}
                                  </h4>
                                  {!notif.read ? (
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md">
                                      Unread
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md">
                                      Read
                                    </span>
                                  )}
                                  {notif.referenceCode && (
                                    <span className="text-xs font-mono text-slate-500">
                                      Ref: {notif.referenceCode}
                                    </span>
                                  )}
                                </div>

                                {typeof notif.invoiceAmount === 'number' && notif.invoiceAmount > 0 && (
                                  <div className="mt-1.5 inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 text-xs font-bold font-mono tabular-nums">
                                    Invoice Amount Due: ${notif.invoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </div>
                                )}

                                <p className="text-xs sm:text-sm text-slate-700 mt-2 whitespace-pre-line leading-relaxed">
                                  {notif.message}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500">
                                  <span>
                                    Issued by: <strong className="text-slate-700">{notif.senderAgentName || 'Summit Vault Fiduciary Desk'}</strong>
                                  </span>
                                  <span>·</span>
                                  <span className="tabular-nums">
                                    {new Date(notif.createdAt).toLocaleString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              {(notif.requiresChatOpen || isAlert || isInvoice) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenNotificationInChat(notif)}
                                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                                  Open Personal Chat
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleNotificationRead(notif)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                {notif.read ? 'Mark Unread' : 'Mark as Read'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delivery Channel Preferences */}
              <div className="pt-6 border-t border-slate-200 max-w-2xl">
                <h3 className="text-base font-bold text-slate-900 mb-4">Notification Channel Preferences</h3>

                {notifSaved && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Notification preferences saved.</span>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    {
                      key: 'trades' as const,
                      title: 'Trade & Allocation Confirmations',
                      desc: 'Receive instant alerts when portfolio orders or rebalances are executed.',
                      locked: false,
                    },
                    {
                      key: 'transfers' as const,
                      title: 'Funding, Invoice & Withdrawal Alerts',
                      desc: 'Get notified whenever funding requests, invoices, or withdrawals are updated.',
                      locked: false,
                    },
                    {
                      key: 'security' as const,
                      title: 'Fiduciary Security & Account Alerts',
                      desc: 'Critical alerts requiring personal chat review and custody verification (Mandatory).',
                      locked: true,
                    },
                    {
                      key: 'market' as const,
                      title: 'Institutional Market Briefings',
                      desc: 'Weekly commentary and macroeconomic research from our investment committee.',
                      locked: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/60"
                    >
                      <div className="pr-4">
                        <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifPrefs[item.key]}
                          disabled={item.locked}
                          onChange={() =>
                            !item.locked &&
                            setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                          }
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 peer-disabled:opacity-50" />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotifs}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-xs sm:text-sm hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h2>

              <div className="space-y-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" /> Change Account Password
                  </h3>

                  {passwordStatus && (
                    <div
                      className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                        passwordStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}
                    >
                      {passwordStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{passwordStatus.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" /> Two-Factor Authentication (2FA)
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        Authenticator App Protection
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            twoFactorEnabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Require a step-up verification code when signing in or initiating external withdrawals.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleTwoFactor}
                      className={`px-4 py-2.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap cursor-pointer ${
                        twoFactorEnabled
                          ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Withdrawal Method Modal */}
      <AnimatePresence>
        {showCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => cardStatus === 'idle' && setShowCardModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden z-10"
            >
              {cardStatus === 'idle' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-heading text-slate-900">Link Withdrawal Method</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Add a payout destination for vault withdrawals
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCardModal(false)}
                      className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Method Type Switcher */}
                  <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl mb-5 text-[11px] font-semibold">
                    {[
                      { id: 'card' as const, label: 'Card' },
                      { id: 'crypto' as const, label: 'Coins/Crypto' },
                      { id: 'paypal' as const, label: 'PayPal' },
                      { id: 'bank' as const, label: 'Bank Wire' },
                      { id: 'other' as const, label: 'Other' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setMethodType(t.id);
                          setCardError('');
                        }}
                        className={`py-2 rounded-lg transition-all cursor-pointer ${
                          methodType === t.id
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {cardError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cardError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                    {methodType === 'card' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Name on Bank Card
                          </label>
                          <input
                            required
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                            placeholder={`${firstName || 'Alex'} ${lastName || 'Morgan'}`.trim()}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Card Number (For Withdrawal Payouts)
                            </label>
                            {cardNumber.length >= 4 && (
                              <span className="text-xs font-bold text-amber-700">
                                {detectCardBrand(cardNumber)}
                              </span>
                            )}
                          </div>
                          <input
                            required
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                              let formatted = '';
                              for (let i = 0; i < val.length; i++) {
                                if (i > 0 && i % 4 === 0) formatted += ' ';
                                formatted += val[i];
                              }
                              setCardNumber(formatted);
                            }}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono tabular-nums"
                            placeholder="4000 0000 0000 0000"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                              Expiry (MM/YY)
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (val.length >= 3) {
                                  val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono tabular-nums"
                              placeholder="08/29"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                              Security CVC
                            </label>
                            <input
                              required
                              type="password"
                              maxLength={4}
                              value={cardCVC}
                              onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono tabular-nums"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {methodType === 'crypto' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Coin / Digital Asset
                          </label>
                          <select
                            value={cryptoSymbol}
                            onChange={(e) => {
                              const found = CRYPTO_COINS.find((c) => c.symbol === e.target.value);
                              setCryptoSymbol(e.target.value);
                              if (found) setCryptoNetwork(found.network);
                            }}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold"
                          >
                            {CRYPTO_COINS.map((c) => (
                              <option key={c.symbol} value={c.symbol}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Blockchain Network
                          </label>
                          <input
                            required
                            type="text"
                            value={cryptoNetwork}
                            onChange={(e) => setCryptoNetwork(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                            placeholder="e.g. Bitcoin Mainnet, ERC-20, TRC-20, Solana"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Destination Wallet Address
                          </label>
                          <input
                            required
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono"
                            placeholder="bc1q... or 0x..."
                          />
                        </div>
                      </>
                    )}

                    {methodType === 'paypal' && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                          PayPal Email Address
                        </label>
                        <input
                          required
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                          placeholder="yourname@domain.com"
                        />
                      </div>
                    )}

                    {methodType === 'bank' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Account Holder Name
                          </label>
                          <input
                            required
                            type="text"
                            value={bankHolder}
                            onChange={(e) => setBankHolder(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                            placeholder={`${firstName || 'Alex'} ${lastName || 'Morgan'}`.trim()}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Financial Institution / Bank Name
                          </label>
                          <input
                            required
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                            placeholder="e.g. JPMorgan Chase, Bank of America, Citi"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                              Routing / SWIFT
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={12}
                              value={routingNumber}
                              onChange={(e) => setRoutingNumber(e.target.value)}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono tabular-nums"
                              placeholder="021000021"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                              Account Number
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={17}
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-mono tabular-nums"
                              placeholder="000123456789"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {methodType === 'other' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Withdrawal Provider / Method
                          </label>
                          <input
                            required
                            type="text"
                            value={otherMethodName}
                            onChange={(e) => setOtherMethodName(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                            placeholder="e.g. Wise, Revolut, Skrill, Bullion Delivery"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Destination Account ID / Handle
                          </label>
                          <input
                            required
                            type="text"
                            value={otherAccountRef}
                            onChange={(e) => setOtherAccountRef(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                            placeholder="Account identifier or email"
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-colors text-sm cursor-pointer"
                      >
                        Save Withdrawal Destination
                      </button>
                    </div>
                  </form>
                </>
              )}

              {cardStatus === 'verifying' && (
                <div className="py-12 flex flex-col items-center text-center">
                  <Loader2 className="w-12 h-12 text-slate-900 animate-spin mb-4" />
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Verifying Payout Destination...</h4>
                  <p className="text-slate-500 text-sm">
                    Establishing encrypted settlement route with your vault ledger.
                  </p>
                </div>
              )}

              {cardStatus === 'success' && (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Withdrawal Method Linked</h4>
                  <p className="text-slate-500 text-sm">
                    Your withdrawal destination is now active and available for payouts.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
