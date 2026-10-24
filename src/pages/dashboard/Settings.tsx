import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Shield, Key, CreditCard, Smartphone, CheckCircle2, Loader2, X } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export function Settings() {
  const { user, profile, signOut, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  const { openAgentChat } = useOutletContext<{ openAgentChat: (prefill?: string) => void }>();
  const [activeTab, setActiveTab] = useState('profile');
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

  const [showCardModal, setShowCardModal] = useState(false);
  const [cardStatus, setCardStatus] = useState('idle');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Login', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Linked Accounts', icon: CreditCard },
  ];

  
  const handleAddCard = (e: FormEvent) => {
    e.preventDefault();
    setCardStatus('verifying');
    setTimeout(() => {
      setCardStatus('success');
      setTimeout(() => {
        setShowCardModal(false);
        setCardStatus('idle');
        setCardNumber('');
        setCardName('');
        setCardExpiry('');
        setCardCVC('');
      }, 2500);
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-2">Account Settings</h1>
        <p className="text-slate-500">Manage your profile, security preferences, and linked accounts.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
                  {firstName?.[0] || profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Assigned Advisor: <span className="text-amber-700">{profile?.assignedAgentName || 'Sarah Jenkins'}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Account Status: <strong className="uppercase text-emerald-600">{profile?.status || 'active'}</strong> · KYC: <strong className="uppercase text-slate-700">{profile?.kycStatus || 'verified'}</strong>
                  </div>
                </div>
              </div>

              {profileSavedMsg && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
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
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" value={profile?.email || user?.email || ""} disabled className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" /> Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50 focus:bg-white" />
                      </div>
                    </div>
                    <button onClick={() => openAgentChat('I want to update my password.')} className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" /> Two-Factor Authentication
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-slate-900">Authenticator App</div>
                      <div className="text-sm text-slate-500 mt-1">Use an app like Google Authenticator or Authy to generate verification codes.</div>
                    </div>
                    <button onClick={() => openAgentChat('I want to enable 2FA.')} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors whitespace-nowrap">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                {[
                  { title: 'Trade Confirmations', desc: 'Receive emails when your trades are executed.' },
                  { title: 'Deposit & Withdrawal Alerts', desc: 'Get notified when funds enter or leave your account.' },
                  { title: 'Security Alerts', desc: 'Critical alerts regarding your account security (Mandatory).' },
                  { title: 'Market Updates', desc: 'Weekly newsletter with market insights and trends.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="pr-4">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i !== 3} disabled={i === 2} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Linked Accounts</h2>
              <p className="text-slate-500 mb-6">Manage external bank accounts linked for deposits and withdrawals.</p>
              
              <div className="space-y-4 mb-8">
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                      CH
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Chase Checking</div>
                      <div className="text-sm text-slate-500">•••• •••• •••• 4829</div>
                    </div>
                  </div>
                  <button onClick={() => openAgentChat('I want to remove a linked bank account.')} className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    Remove
                  </button>
                </div>
              </div>
              
              <button onClick={() => setShowCardModal(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" /> Link New Card or Account
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Card Modal */}
      <AnimatePresence>
        {showCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => cardStatus === 'idle' && setShowCardModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
              
              {cardStatus === 'idle' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold font-heading text-slate-900">Add Payment Method</h3>
                    <button onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name on Card</label>
                      <input required type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                      <input required type="text" maxLength="19" pattern="[0-9\\s]+" value={cardNumber} onChange={e => {
                        let val = e.target.value.replace(/\\s+/g, '').replace(/[^0-9]/gi, '');
                        let formatted = '';
                        for(let i=0; i<val.length; i++) {
                          if(i > 0 && i % 4 === 0) formatted += ' ';
                          formatted += val[i];
                        }
                        setCardNumber(formatted);
                      }} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                        <input required type="text" maxLength="5" value={cardExpiry} onChange={e => {
                          let val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                          setCardExpiry(val);
                        }} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                        <input required type="password" maxLength="4" value={cardCVC} onChange={e => setCardCVC(e.target.value.replace(/[^0-9]/g, ''))} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" placeholder="123" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors">
                        Verify & Add Card
                      </button>
                    </div>
                  </form>
                </>
              )}

              {cardStatus === 'verifying' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">Verifying Node...</h3>
                  <p className="text-slate-500 text-sm">Connecting to secure financial gateway and validating credentials.</p>
                </div>
              )}

              {cardStatus === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">Verified & Added</h3>
                  <p className="text-slate-500 text-sm">Your payment method has been securely linked to your account.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
