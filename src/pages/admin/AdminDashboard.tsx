import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, DollarSign, MessageSquare, Shield, Settings, Trash2, Plus, Search,
  Edit2, Save, X, CheckCircle2, Send, Lock, UserPlus, RefreshCw, ArrowUpRight,
  TrendingUp, AlertCircle, LogOut, UserCheck, Key, Briefcase, Phone, Mail
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy
} from 'firebase/firestore';
import { db, createClientAuthAccount, handleFirestoreError, OperationType } from '../../lib/firebase';
import { UserProfile } from '../../lib/AuthContext';
import { useAgents, AgentRecord } from '../../lib/agentsData';
import { lockAdminSession } from '../../components/admin/AdminGate';
import { Logo } from '../../components/ui/Logo';

interface ChatSession {
  userId: string;
  userEmail?: string;
  userName?: string;
  selectedAgentId?: string;
  selectedAgentName?: string;
  selectedAgentRole?: string;
  selectedAgentAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadByAdmin?: number;
  unreadByClient?: number;
  updatedAt?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  senderRole: 'client' | 'admin';
  senderName?: string;
  agentId?: string;
  agentName?: string;
  agentRole?: string;
  agentAvatar?: string;
  text: string;
  createdAt: string;
}

export function AdminDashboard({ initialTab = 'clients' }: { initialTab?: 'clients' | 'chats' | 'agents' | 'settings' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { agents } = useAgents();

  // Determine active tab from route or state
  const [activeTab, setActiveTab] = useState<'clients' | 'chats' | 'agents' | 'settings'>(() => {
    if (location.pathname.includes('/agents')) return 'agents';
    if (location.pathname.includes('/balances')) return 'clients';
    return initialTab;
  });

  // Real-time Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  // Status banner
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Create New Client Account Modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '+1 (555) 000-0000',
    totalBalance: 145000,
    investedAmount: 95000,
    cashBalance: 50000,
    returnsAmount: 14200,
    role: 'client' as 'client' | 'admin',
    status: 'active' as 'active' | 'suspended' | 'pending',
    kycStatus: 'verified' as 'verified' | 'pending' | 'action_required',
    assignedAgentId: 'AG-001',
    notes: '',
  });

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Purge confirmation modal
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Real-time Chats state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [respondAsAgentId, setRespondAsAgentId] = useState<string>('AG-001');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Manage Agents Modal state
  const [editingAgent, setEditingAgent] = useState<AgentRecord | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState<AgentRecord>({
    id: '',
    name: '',
    email: '',
    role: '',
    exp: '10 yrs exp',
    location: 'Las Vegas, NV',
    lang: 'English',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    status: 'Active',
    aum: '$25.0M',
    clients: 40,
    bio: '',
  });

  // Admin Settings Passcode state
  const [currentPasscode, setCurrentPasscode] = useState('909090');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [isSavingPasscode, setIsSavingPasscode] = useState(false);

  // 1. Subscribe to all users in real time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            userId: data.userId || d.id,
            email: data.email || '',
            firstName: data.firstName || 'Investor',
            lastName: data.lastName || '',
            phone: data.phone || '+1 (555) 000-0000',
            totalBalance: Number(data.totalBalance ?? 0),
            investedAmount: Number(data.investedAmount ?? 0),
            cashBalance: Number(data.cashBalance ?? 0),
            returnsAmount: Number(data.returnsAmount ?? 0),
            role: data.role || 'client',
            status: data.status || 'active',
            kycStatus: data.kycStatus || 'verified',
            assignedAgentId: data.assignedAgentId || 'AG-001',
            assignedAgentName: data.assignedAgentName || 'Sarah Jenkins',
            notes: data.notes || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setUsers(list);
        setUsersLoading(false);
      },
      (err) => {
        console.error('Error listening to users:', err);
        setUsersLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 2. Subscribe to all chat sessions in real time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'chats'),
      (snap) => {
        const list: ChatSession[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as ChatSession), userId: d.id });
        });
        list.sort((a, b) => (b.lastMessageAt || b.updatedAt || '').localeCompare(a.lastMessageAt || a.updatedAt || ''));
        setChatSessions(list);
      },
      (err) => {
        console.warn('Error listening to chats:', err);
      }
    );
    return () => unsub();
  }, []);

  // 3. Subscribe to messages of the currently selected client chat
  useEffect(() => {
    if (!selectedChatUserId) {
      setChatMessages([]);
      return;
    }

    // Clear unreadByAdmin when opening chat
    const session = chatSessions.find((c) => c.userId === selectedChatUserId);
    if (session?.selectedAgentId) {
      setRespondAsAgentId(session.selectedAgentId);
    }
    if (session && (session.unreadByAdmin || 0) > 0) {
      updateDoc(doc(db, 'chats', selectedChatUserId), { unreadByAdmin: 0 }).catch(() => {});
    }

    const q = query(collection(db, 'chats', selectedChatUserId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: ChatMessage[] = [];
        snap.forEach((d) => {
          msgs.push(d.data() as ChatMessage);
        });
        setChatMessages(msgs);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
      (err) => {
        console.warn('Error loading chat messages:', err);
      }
    );

    return () => unsub();
  }, [selectedChatUserId]);

  // 4. Subscribe to system adminConfig passcode
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'system', 'adminConfig'),
      (snap) => {
        if (snap.exists() && snap.data()?.passcode) {
          setCurrentPasscode(String(snap.data().passcode));
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Create New User Account Handler
  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email.trim()) return;
    setIsCreatingUser(true);

    try {
      const cleanEmail = newUserForm.email.trim().toLowerCase();
      const uid = await createClientAuthAccount(cleanEmail, newUserForm.password);
      const selectedAgent = agents.find((a) => a.id === newUserForm.assignedAgentId) || agents[0];

      const profileData: UserProfile = {
        userId: uid,
        email: cleanEmail,
        firstName: newUserForm.firstName.trim() || 'Investor',
        lastName: newUserForm.lastName.trim() || '',
        phone: newUserForm.phone.trim() || '+1 (555) 000-0000',
        totalBalance: Number(newUserForm.totalBalance) || 0,
        investedAmount: Number(newUserForm.investedAmount) || 0,
        cashBalance: Number(newUserForm.cashBalance) || 0,
        returnsAmount: Number(newUserForm.returnsAmount) || 0,
        role: newUserForm.role,
        status: newUserForm.status,
        kycStatus: newUserForm.kycStatus,
        assignedAgentId: selectedAgent?.id || 'AG-001',
        assignedAgentName: selectedAgent?.name || 'Sarah Jenkins',
        notes: newUserForm.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), profileData);

      setShowCreateUserModal(false);
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '+1 (555) 000-0000',
        totalBalance: 145000,
        investedAmount: 95000,
        cashBalance: 50000,
        returnsAmount: 14200,
        role: 'client',
        status: 'active',
        kycStatus: 'verified',
        assignedAgentId: 'AG-001',
        notes: '',
      });
      showNotification(`Account provisioned for ${cleanEmail} with $${profileData.totalBalance.toLocaleString()} balance.`);
    } catch (err) {
      console.error('Error creating user:', err);
      showNotification('Failed to provision user account.', 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Save Edited User Profile & Balances Handler
  const handleSaveUserEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);

    try {
      const selectedAgent = agents.find((a) => a.id === editingUser.assignedAgentId);
      const updatedProfile: UserProfile = {
        ...editingUser,
        email: editingUser.email.trim().toLowerCase(),
        firstName: (editingUser.firstName || '').trim(),
        lastName: (editingUser.lastName || '').trim(),
        phone: (editingUser.phone || '').trim(),
        totalBalance: Number(editingUser.totalBalance) || 0,
        investedAmount: Number(editingUser.investedAmount) || 0,
        cashBalance: Number(editingUser.cashBalance) || 0,
        returnsAmount: Number(editingUser.returnsAmount) || 0,
        assignedAgentId: selectedAgent?.id || editingUser.assignedAgentId || 'AG-001',
        assignedAgentName: selectedAgent?.name || editingUser.assignedAgentName || 'Sarah Jenkins',
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', editingUser.userId), updatedProfile, { merge: true });
      setEditingUser(null);
      showNotification(`Real-time profile and balances updated for ${updatedProfile.firstName || updatedProfile.email}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${editingUser.userId}`);
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete Single User Account
  const handleDeleteUser = async (u: UserProfile) => {
    try {
      await deleteDoc(doc(db, 'users', u.userId));
      showNotification(`Removed client account ${u.email}.`);
      if (editingUser?.userId === u.userId) setEditingUser(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${u.userId}`);
    }
  };

  // Purge All Accounts
  const handlePurgeAllAccounts = async () => {
    setIsPurging(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const d of usersSnap.docs) {
        await deleteDoc(doc(db, 'users', d.id));
      }
      const adminsSnap = await getDocs(collection(db, 'admins'));
      for (const d of adminsSnap.docs) {
        await deleteDoc(doc(db, 'admins', d.id));
      }
      setShowPurgeConfirm(false);
      showNotification(`Successfully purged ${usersSnap.size} accounts from Firestore.`);
    } catch (e: unknown) {
      showNotification('Purge failed: ' + (e instanceof Error ? e.message : String(e)), 'error');
    } finally {
      setIsPurging(false);
    }
  };

  // Open Chat for a specific user from the Clients table
  const openChatForUser = async (u: UserProfile) => {
    const existingSession = chatSessions.find((c) => c.userId === u.userId);
    const agent = agents.find((a) => a.id === u.assignedAgentId) || agents[0];
    if (!existingSession) {
      const initialSession: ChatSession = {
        userId: u.userId,
        userEmail: u.email,
        userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        selectedAgentId: agent?.id || 'AG-001',
        selectedAgentName: agent?.name || 'Sarah Jenkins',
        selectedAgentRole: agent?.role || 'Wealth Specialist',
        selectedAgentAvatar: agent?.img || '',
        lastMessage: 'Conversation initialized by Fiduciary Desk',
        lastMessageAt: new Date().toISOString(),
        unreadByAdmin: 0,
        unreadByClient: 0,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'chats', u.userId), initialSession, { merge: true });
    }
    setSelectedChatUserId(u.userId);
    if (agent) setRespondAsAgentId(agent.id);
    setActiveTab('chats');
  };

  // Send Admin Reply (as chosen Agent persona)
  const handleSendAdminReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserId || !replyText.trim()) return;
    setIsSendingReply(true);

    try {
      const chosenAgent = agents.find((a) => a.id === respondAsAgentId) || agents[0];
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const targetUser = users.find((u) => u.userId === selectedChatUserId);
      const currentSession = chatSessions.find((c) => c.userId === selectedChatUserId);

      const newMsg: ChatMessage = {
        id: msgId,
        userId: selectedChatUserId,
        senderRole: 'admin',
        senderName: chosenAgent?.name || 'Sarah Jenkins',
        agentId: chosenAgent?.id || 'AG-001',
        agentName: chosenAgent?.name || 'Sarah Jenkins',
        agentRole: chosenAgent?.role || 'Senior Fiduciary Advisor',
        agentAvatar: chosenAgent?.img || '',
        text: replyText.trim(),
        createdAt: now,
      };

      await setDoc(doc(db, 'chats', selectedChatUserId, 'messages', msgId), newMsg);

      const sessionUpdate: ChatSession = {
        userId: selectedChatUserId,
        userEmail: currentSession?.userEmail || targetUser?.email || '',
        userName: currentSession?.userName || `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() || 'Client',
        selectedAgentId: chosenAgent?.id || 'AG-001',
        selectedAgentName: chosenAgent?.name || 'Sarah Jenkins',
        selectedAgentRole: chosenAgent?.role || 'Senior Fiduciary Advisor',
        selectedAgentAvatar: chosenAgent?.img || '',
        lastMessage: replyText.trim(),
        lastMessageAt: now,
        unreadByAdmin: 0,
        unreadByClient: (currentSession?.unreadByClient || 0) + 1,
        updatedAt: now,
      };

      await setDoc(doc(db, 'chats', selectedChatUserId), sessionUpdate, { merge: true });
      setReplyText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${selectedChatUserId}`);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Save Agent (Create or Update)
  const handleSaveAgent = async (e: FormEvent) => {
    e.preventDefault();
    const id = editingAgent ? editingAgent.id : `AG-${String(agents.length + 1).padStart(3, '0')}`;
    const record: AgentRecord = {
      ...agentForm,
      id,
      name: agentForm.name.trim(),
      role: agentForm.role.trim(),
      email: agentForm.email.trim(),
      clients: Number(agentForm.clients) || 0,
    };

    try {
      await setDoc(doc(db, 'agents', id), record, { merge: true });
      setShowAgentModal(false);
      setEditingAgent(null);
      showNotification(`Accredited agent ${record.name} saved.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `agents/${id}`);
    }
  };

  const handleDeleteAgent = async (ag: AgentRecord) => {
    try {
      await deleteDoc(doc(db, 'agents', ag.id));
      showNotification(`Removed agent ${ag.name}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `agents/${ag.id}`);
    }
  };

  // Update Admin Passcode in Settings
  const handleUpdatePasscode = async (e: FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length < 4) {
      showNotification('Passcode must be at least 4 characters.', 'error');
      return;
    }
    if (newPasscode.trim() !== confirmPasscode.trim()) {
      showNotification('New passcode and confirmation do not match.', 'error');
      return;
    }

    setIsSavingPasscode(true);
    try {
      await setDoc(doc(db, 'system', 'adminConfig'), {
        passcode: newPasscode.trim(),
        updatedAt: new Date().toISOString(),
      });
      setNewPasscode('');
      setConfirmPasscode('');
      showNotification('Admin Master Passcode updated in real time.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'system/adminConfig');
    } finally {
      setIsSavingPasscode(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.assignedAgentName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const totalClientBalances = users.reduce((sum, u) => sum + (Number(u.totalBalance) || 0), 0);
  const totalUnreadChats = chatSessions.reduce((sum, c) => sum + (Number(c.unreadByAdmin) || 0), 0);
  const activeChatSession = chatSessions.find((c) => c.userId === selectedChatUserId);
  const activeChatUser = users.find((u) => u.userId === selectedChatUserId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <Logo dark />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Master Admin Command
            </span>
          </div>

          {/* Primary Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clients & Balances</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-950/20 font-bold">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'chats'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>2-Way Live Chats</span>
              {totalUnreadChats > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500 text-white font-bold">
                  {totalUnreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'agents'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Agents ({agents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin Settings</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                lockAdminSession();
                window.location.reload();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Lock Admin Session"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lock Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-lg ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2.5 text-sm font-medium">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <span>{toast.text}</span>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-Time KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Registered Client Vaults</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">{users.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1">Live Firestore Sync Active</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Client Ledger Total Balance</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
              ${totalClientBalances.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Instant real-time balance reflection</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Active Client Chat Threads</span>
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {chatSessions.length}
            </div>
            <div className="text-[11px] text-amber-400 mt-1">
              {totalUnreadChats > 0 ? `${totalUnreadChats} unread message(s)` : 'All agent threads funneled here'}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Accredited Agents Roster</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {agents.filter((a) => a.status === 'Active').length} / {agents.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Available for persona response</div>
          </div>
        </div>

        {/* ==================== TAB 1: CLIENTS & BALANCES ==================== */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search clients by name, email, or assigned agent..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-950/30 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Client Account</span>
                </button>

                <button
                  onClick={() => setShowPurgeConfirm(true)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge All</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                      <th className="p-4 pl-6">Client Profile</th>
                      <th className="p-4">Status / KYC</th>
                      <th className="p-4">Assigned Agent</th>
                      <th className="p-4">Total Balance</th>
                      <th className="p-4">Invested</th>
                      <th className="p-4">Liquid Cash</th>
                      <th className="p-4">Returns</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          Synchronizing live client vaults from Firestore...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center">
                          <div className="max-w-sm mx-auto">
                            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-white font-semibold mb-1">No Client Accounts Found</p>
                            <p className="text-xs text-slate-500 mb-4">
                              Click "Create New Client Account" above to provision a client with custom balances, or have a user sign up at /signup.
                            </p>
                            <button
                              onClick={() => setShowCreateUserModal(true)}
                              className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" /> Create First Account
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.userId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 flex-shrink-0">
                                {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-2">
                                  <span>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Investor'}</span>
                                  {u.role === 'admin' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                                {u.phone && <div className="text-[11px] text-slate-500">{u.phone}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                                  u.status === 'suspended'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : u.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                              >
                                {u.status || 'active'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                KYC: <strong className="text-slate-300">{u.kycStatus || 'verified'}</strong>
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="text-xs font-medium text-slate-200">
                              {u.assignedAgentName || 'Sarah Jenkins'}
                            </div>
                            <div className="text-[11px] text-slate-500">{u.assignedAgentId || 'AG-001'}</div>
                          </td>

                          <td className="p-4 font-bold text-white text-base">
                            ${Number(u.totalBalance || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-slate-300">
                            ${Number(u.investedAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-slate-300">
                            ${Number(u.cashBalance || 0).toLocaleString()}
                          </td>
                          <td className="p-4 text-emerald-400 font-semibold">
                            +${Number(u.returnsAmount || 0).toLocaleString()}
                          </td>

                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingUser({ ...u })}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit Profile & Balances
                              </button>
                              <button
                                onClick={() => openChatForUser(u)}
                                className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-colors cursor-pointer"
                                title="Message Client"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: 2-WAY LIVE CLIENT CHATS ==================== */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[620px]">
            {/* Left Sidebar: All Client Conversations & Client Roster */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h2 className="text-base font-bold text-white flex items-center justify-between">
                  <span>All Client Conversations</span>
                  <span className="text-xs font-normal text-amber-400">Funnels All Agents</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every client message to any advisor routes here in real time.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {chatSessions.length === 0 && users.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No active client conversations yet.
                  </div>
                ) : (
                  <>
                    {chatSessions.map((session) => {
                      const isSelected = selectedChatUserId === session.userId;
                      return (
                        <button
                          key={session.userId}
                          onClick={() => setSelectedChatUserId(session.userId)}
                          className={`w-full text-left p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                            isSelected ? 'bg-slate-800/90 border-l-4 border-l-amber-400' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 flex-shrink-0">
                            {(session.userName?.[0] || session.userEmail?.[0] || 'C').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-white text-sm truncate">
                                {session.userName || session.userEmail || 'Client'}
                              </span>
                              {(session.unreadByAdmin || 0) > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                                  {session.unreadByAdmin} new
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-amber-400/90 font-medium truncate mt-0.5">
                              Requested Agent: {session.selectedAgentName || 'Sarah Jenkins'}
                            </div>
                            <div className="text-xs text-slate-400 truncate mt-1">
                              {session.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Also list registered clients without an active chat session so Admin can message them */}
                    {users
                      .filter((u) => !chatSessions.some((c) => c.userId === u.userId))
                      .map((u) => (
                        <button
                          key={u.userId}
                          onClick={() => openChatForUser(u)}
                          className="w-full text-left p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                              {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div className="text-sm font-medium text-slate-300 truncate">
                                {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                            </div>
                          </div>
                          <span className="text-[11px] text-amber-400 font-semibold whitespace-nowrap">
                            + Start Chat
                          </span>
                        </button>
                      ))}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Active 2-Way Conversation & Agent Persona Switcher */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
              {selectedChatUserId ? (
                <>
                  {/* Conversation Header with Agent Persona Selector */}
                  <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">
                          {activeChatSession?.userName ||
                            `${activeChatUser?.firstName || ''} ${activeChatUser?.lastName || ''}`.trim() ||
                            activeChatSession?.userEmail ||
                            'Client Vault Chat'}
                        </h3>
                        <span className="text-xs text-slate-400">
                          ({activeChatSession?.userEmail || activeChatUser?.email})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Client chose to speak with:{' '}
                        <strong className="text-amber-400">
                          {activeChatSession?.selectedAgentName || 'Sarah Jenkins'}
                        </strong>
                      </div>
                    </div>

                    {/* Admin "Respond As Agent" Selector */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        Respond As:
                      </span>
                      <select
                        value={respondAsAgentId}
                        onChange={(e) => setRespondAsAgentId(e.target.value)}
                        className="bg-transparent text-amber-300 font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer"
                      >
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id} className="bg-slate-900 text-white">
                            {ag.name} ({ag.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/30">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                        <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-400 font-medium">No messages in this thread yet</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Choose an agent persona above and send a message to initiate real-time chat with this client.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isAdminMsg = msg.senderRole === 'admin';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                          >
                            <div className="text-[11px] text-slate-400 mb-1 px-1 flex items-center gap-1.5">
                              {isAdminMsg ? (
                                <>
                                  <span className="text-amber-400 font-semibold">
                                    Sent as {msg.agentName || 'Advisor'}
                                  </span>
                                  <span>·</span>
                                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-emerald-400 font-semibold">
                                    {msg.senderName || 'Client'}
                                  </span>
                                  {msg.agentName && (
                                    <span className="text-slate-500">(to {msg.agentName})</span>
                                  )}
                                  <span>·</span>
                                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              )}
                            </div>
                            <div
                              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                isAdminMsg
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-xs shadow-md'
                                  : 'bg-slate-800 border border-slate-700 text-white rounded-tl-xs'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Admin Reply Composer */}
                  <form
                    onSubmit={handleSendAdminReply}
                    className="p-4 border-t border-slate-800 bg-slate-900 flex items-end gap-3"
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to client as ${agents.find((a) => a.id === respondAsAgentId)?.name || 'Advisor'}...`}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAdminReply(e);
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-2xl p-3.5 text-sm text-white focus:outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSendingReply || !replyText.trim()}
                      className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-950/30"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">Select a Client Conversation</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Pick any client from the left panel to view messages and respond under any Accredited Agent persona in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: MANAGE AGENTS ==================== */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold font-heading text-white">Accredited Fiduciary Agents</h2>
                <p className="text-xs text-slate-400">
                  Agents provisioned here appear live on /agents and in the Client & Admin chat persona selectors.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAgent(null);
                  setAgentForm({
                    id: `AG-00${agents.length + 1}`,
                    name: '',
                    email: '',
                    role: 'Wealth & Estate Specialist',
                    exp: '10 yrs exp',
                    location: 'Las Vegas, NV',
                    lang: 'English',
                    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
                    status: 'Active',
                    aum: '$25.0M',
                    clients: 45,
                    bio: 'Senior accredited fiduciary specializing in multi-asset portfolios and private vault insurance.',
                  });
                  setShowAgentModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Provision New Agent
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={ag.img}
                        alt={ag.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-white truncate">{ag.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ag.status === 'Active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {ag.status}
                          </span>
                        </div>
                        <div className="text-xs text-amber-400 font-medium">{ag.role}</div>
                        <div className="text-[11px] text-slate-500 truncate">{ag.email}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4">{ag.bio}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      AUM: <strong className="text-white">{ag.aum}</strong> · {ag.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingAgent(ag);
                          setAgentForm(ag);
                          setShowAgentModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(ag)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ADMIN SETTINGS (PASSCODE) ==================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading text-white">Master Admin Security Settings</h2>
                <p className="text-xs text-slate-400">
                  Configure the Master Passcode required to access /admin across all devices.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Active Admin Passcode</div>
                <div className="text-lg font-mono font-bold text-amber-400 tracking-widest mt-0.5">
                  {currentPasscode}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Synced with Firestore
              </span>
            </div>

            <form onSubmit={handleUpdatePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  New Admin Passcode
                </label>
                <input
                  type="text"
                  required
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode (e.g. 909090)"
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Confirm New Passcode
                </label>
                <input
                  type="text"
                  required
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Confirm new passcode"
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPasscode}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all cursor-pointer"
              >
                {isSavingPasscode ? 'Updating Passcode...' : 'Save New Admin Passcode'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ==================== MODAL: CREATE NEW CLIENT ACCOUNT ==================== */}
      <AnimatePresence>
        {showCreateUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateUserModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">Create New Client Account</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Provisions a live Firebase Auth login and initializes real-time Firestore balances.
                  </p>
                </div>
                <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.firstName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                      placeholder="Alexander"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={newUserForm.lastName}
                      onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                      placeholder="Sterling"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Client Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="client@domain.com"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Login Password (min 6 chars) *</label>
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="VaultPass2026!"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Assigned Fiduciary Agent</label>
                    <select
                      value={newUserForm.assignedAgentId}
                      onChange={(e) => setNewUserForm({ ...newUserForm, assignedAgentId: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} — {ag.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-xs text-amber-400 font-semibold mb-1">Total Balance ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.totalBalance}
                      onChange={(e) => setNewUserForm({ ...newUserForm, totalBalance: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Invested ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.investedAmount}
                      onChange={(e) => setNewUserForm({ ...newUserForm, investedAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Liquid Cash ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.cashBalance}
                      onChange={(e) => setNewUserForm({ ...newUserForm, cashBalance: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-400 mb-1">Returns ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.returnsAmount}
                      onChange={(e) => setNewUserForm({ ...newUserForm, returnsAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Account Status</label>
                    <select
                      value={newUserForm.status}
                      onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value as any })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">KYC Verification</label>
                    <select
                      value={newUserForm.kycStatus}
                      onChange={(e) => setNewUserForm({ ...newUserForm, kycStatus: e.target.value as any })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="action_required">Action Required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">System Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm cursor-pointer"
                  >
                    {isCreatingUser ? 'Provisioning Vault...' : 'Create Account & Set Balances'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL: EDIT CLIENT PROFILE & BALANCES ==================== */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">
                    Edit Client Profile & Real-Time Balances
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Changes saved here reflect immediately on the client's live dashboard.
                  </p>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUserEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editingUser.firstName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editingUser.lastName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                {/* Quick Balance Credit / Debit Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-semibold text-amber-400 mb-2">
                    Quick Balance Adjustments (Applies to Total & Cash)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[1000, 5000, 10000, 50000, 100000, -1000, -5000, -10000].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setEditingUser({
                            ...editingUser,
                            totalBalance: Math.max(0, Number(editingUser.totalBalance || 0) + delta),
                            cashBalance: Math.max(0, Number(editingUser.cashBalance || 0) + delta),
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                          delta > 0
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        {delta > 0 ? `+$${delta.toLocaleString()}` : `-$${Math.abs(delta).toLocaleString()}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-amber-400 font-semibold mb-1">Total Balance ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.totalBalance}
                      onChange={(e) => setEditingUser({ ...editingUser, totalBalance: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Invested ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.investedAmount}
                      onChange={(e) => setEditingUser({ ...editingUser, investedAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Liquid Cash ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.cashBalance}
                      onChange={(e) => setEditingUser({ ...editingUser, cashBalance: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-400 mb-1">Returns ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.returnsAmount}
                      onChange={(e) => setEditingUser({ ...editingUser, returnsAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Assigned Fiduciary Agent</label>
                    <select
                      value={editingUser.assignedAgentId || 'AG-001'}
                      onChange={(e) => {
                        const ag = agents.find((a) => a.id === e.target.value);
                        setEditingUser({
                          ...editingUser,
                          assignedAgentId: e.target.value,
                          assignedAgentName: ag?.name || 'Sarah Jenkins',
                        });
                      }}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Account Status</label>
                    <select
                      value={editingUser.status || 'active'}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">KYC Status</label>
                    <select
                      value={editingUser.kycStatus || 'verified'}
                      onChange={(e) => setEditingUser({ ...editingUser, kycStatus: e.target.value as any })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="action_required">Action Req</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Internal Fiduciary Notes</label>
                  <textarea
                    rows={2}
                    value={editingUser.notes || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                    placeholder="Private notes regarding client portfolio preferences..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingUser ? 'Saving...' : 'Save Changes Live'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL: CREATE / EDIT AGENT ==================== */}
      <AnimatePresence>
        {showAgentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAgentModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-heading text-white">
                  {editingAgent ? 'Edit Accredited Agent' : 'Provision Accredited Agent'}
                </h3>
                <button onClick={() => setShowAgentModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAgent} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={agentForm.name}
                    onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Specialty Role *</label>
                    <input
                      type="text"
                      required
                      value={agentForm.role}
                      onChange={(e) => setAgentForm({ ...agentForm, role: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Status</label>
                    <select
                      value={agentForm.status}
                      onChange={(e) => setAgentForm({ ...agentForm, status: e.target.value as any })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={agentForm.email}
                      onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={agentForm.location}
                      onChange={(e) => setAgentForm({ ...agentForm, location: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Portrait Image URL</label>
                  <input
                    type="text"
                    value={agentForm.img}
                    onChange={(e) => setAgentForm({ ...agentForm, img: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Advisor Biography</label>
                  <textarea
                    rows={3}
                    value={agentForm.bio}
                    onChange={(e) => setAgentForm({ ...agentForm, bio: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm resize-none"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAgentModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm cursor-pointer"
                  >
                    Save Agent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL: PURGE CONFIRMATION ==================== */}
      <AnimatePresence>
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPurgeConfirm(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 text-center"
            >
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Purge All Client Accounts?</h3>
              <p className="text-xs text-slate-400 mb-6">
                This will permanently remove all client documents in the Firestore users collection. This operation cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurgeConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurgeAllAccounts}
                  disabled={isPurging}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold cursor-pointer"
                >
                  {isPurging ? 'Purging...' : 'Confirm Purge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
