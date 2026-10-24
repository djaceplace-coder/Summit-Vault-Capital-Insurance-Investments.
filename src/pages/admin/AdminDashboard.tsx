import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, DollarSign, MessageSquare, Shield, Settings, Trash2, Plus, Search,
  Edit2, Save, X, CheckCircle2, Send, Lock, UserPlus, Bell, Receipt,
  AlertCircle, Key, Briefcase, FileText, ShieldAlert, ArrowDownLeft, Eye, CheckCheck, Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  collection, doc, getDoc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy
} from 'firebase/firestore';
import { db, createClientAuthAccount, handleFirestoreError, OperationType } from '../../lib/firebase';
import { UserProfile, OFFICIAL_ADMIN_EMAIL } from '../../lib/AuthContext';
import { useAgents, AgentRecord } from '../../lib/agentsData';
import { lockAdminSession } from '../../components/admin/AdminGate';
import { Logo } from '../../components/ui/Logo';
import { UserNotificationItem } from '../dashboard/Settings';

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
  messageType?: 'text' | 'funding_request' | 'invoice' | 'account_alert' | 'letter';
  fundingOrigin?: string;
  fundingReason?: string;
  fundingAmount?: number;
  letterTitle?: string;
  letterCategory?: string;
  letterReference?: string;
  invoiceAmount?: number;
  invoiceDueDate?: string;
  requiresAction?: boolean;
  createdAt: string;
}

interface LetterTemplateRecord {
  id: string;
  name: string;
  templateType: 'invoice' | 'account_alert' | 'letter';
  category: string;
  title: string;
  body: string;
  defaultAmount?: number;
  createdAt?: string;
}

const DEFAULT_LETTER_TEMPLATES: LetterTemplateRecord[] = [
  {
    id: 'TPL-INV-01',
    name: 'Vault Funding & Custody Settlement Invoice',
    templateType: 'invoice',
    category: 'Official Vault Invoice',
    title: 'Fiduciary Custody & Allocation Settlement Invoice',
    defaultAmount: 10000,
    body: 'OFFICIAL SUMMIT VAULT CAPITAL INVOICE\n\nPlease review the itemized settlement invoice above for your pending vault capital deposit. Upon wire or digital asset remittance confirmation in this encrypted chat thread, your full principal will be credited immediately to your liquid vault balance.\n\nReply directly in this chat once transfer is initiated.',
  },
  {
    id: 'TPL-INV-02',
    name: 'Tax Clearance & International Wire Release Invoice',
    templateType: 'invoice',
    category: 'Compliance & Tax Settlement Invoice',
    title: 'Cross-Border Settlement & Fiduciary Clearance Invoice',
    defaultAmount: 2500,
    body: 'FIDUCIARY CLEARANCE & SETTLEMENT STATEMENT\n\nIn accordance with institutional custody compliance protocols, please review the required settlement clearance fee above prior to external disbursement execution. Contact your assigned specialist in this personal chat for immediate settlement coordinates.',
  },
  {
    id: 'TPL-ALT-01',
    name: 'Security Protocol Verification Alert (Personal Chat Required)',
    templateType: 'account_alert',
    category: 'Security Protocol Alert',
    title: 'URGENT: Mandatory Vault Security Protocol Verification',
    body: 'OFFICIAL ACCOUNT SECURITY DIRECTIVE\n\nOur fiduciary risk desk has flagged a security protocol requirement on your vault profile. To maintain uninterrupted withdrawal and allocation privileges, you must respond directly in this personal advisor chat to confirm your recent account activity.',
  },
  {
    id: 'TPL-ALT-02',
    name: 'Withdrawal Clearance & Compliance Alert (Personal Chat Required)',
    templateType: 'account_alert',
    category: 'Withdrawal Clearance Alert',
    title: 'Action Required: Withdrawal Settlement Verification',
    body: 'WITHDRAWAL COMPLIANCE NOTICE\n\nYour pending payout destination requires direct fiduciary sign-off before funds can be released to your external card, crypto wallet, or bank account. Please reply in this personal chat thread to complete step-up verification with your advisor.',
  },
  {
    id: 'TPL-ALT-03',
    name: 'KYC / AML Fiduciary Audit Notice (Personal Chat Required)',
    templateType: 'account_alert',
    category: 'Compliance & KYC Alert',
    title: 'Institutional KYC / Custodial Audit Notification',
    body: 'CUSTODIAL AUDIT DIRECTIVE\n\nPlease open your personal chat immediately to confirm your beneficiary and source-of-funds attestation with your assigned Summit Vault Capital specialist.',
  },
  {
    id: 'TPL-LET-01',
    name: 'Official Certificate of Vault Custody & Allocation',
    templateType: 'letter',
    category: 'Official Fiduciary Letter',
    title: 'Confirmation of Institutional Vault Custody',
    body: 'Dear Valued Client,\n\nThis official letter confirms that your capital reserves and portfolio holdings are held under segregated fiduciary custody with Summit Vault Capital. Should you require bespoke liquidity structuring or policy underwriting, reply directly in this thread.\n\nSincerely,\nSummit Vault Capital Fiduciary Desk\nadmin@summitvaultcapital.online',
  },
];

export function AdminDashboard({
  initialTab = 'clients',
}: {
  initialTab?: 'clients' | 'chats' | 'notifications' | 'agents' | 'settings';
}) {
  const location = useLocation();
  const { agents } = useAgents();

  const [activeTab, setActiveTab] = useState<'clients' | 'chats' | 'notifications' | 'agents' | 'settings'>(() => {
    if (location.pathname.includes('/agents')) return 'agents';
    if (location.pathname.includes('/chats')) return 'chats';
    if (location.pathname.includes('/notifications')) return 'notifications';
    if (location.pathname.includes('/settings')) return 'settings';
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
    totalBalance: 0,
    investedAmount: 0,
    cashBalance: 0,
    returnsAmount: 0,
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

  // In-Chat Official Letter / Invoice / Alert Composer Modal state
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<LetterTemplateRecord[]>(DEFAULT_LETTER_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_LETTER_TEMPLATES[0].id);
  const [letterType, setLetterType] = useState<'invoice' | 'account_alert' | 'letter'>('invoice');
  const [letterCategory, setLetterCategory] = useState('Official Vault Invoice');
  const [letterReference, setLetterReference] = useState(() => `SVC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [letterTitle, setLetterTitle] = useState(DEFAULT_LETTER_TEMPLATES[0].title);
  const [letterBody, setLetterBody] = useState(DEFAULT_LETTER_TEMPLATES[0].body);
  const [invoiceAmount, setInvoiceAmount] = useState<string>('10000');
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>(() => {
    const d = new Date(Date.now() + 3 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [saveAsNewTemplateName, setSaveAsNewTemplateName] = useState('');
  const [sendingLetter, setSendingLetter] = useState(false);

  // Real-Time Notifications Manager state (Tab: 'notifications')
  const [selectedNotifUserId, setSelectedNotifUserId] = useState<string>('ALL');
  const [inspectUserId, setInspectUserId] = useState<string>('');
  const [inspectedUserNotifs, setInspectedUserNotifs] = useState<UserNotificationItem[]>([]);
  const [notifForm, setNotifForm] = useState({
    category: 'account_alert' as UserNotificationItem['category'],
    priority: 'high' as 'critical' | 'high' | 'normal',
    title: '',
    message: '',
    referenceCode: `ALT-${Math.floor(10000 + Math.random() * 90000)}`,
    invoiceAmount: '',
    requiresChatOpen: true,
    alsoSendToChat: true,
  });
  const [sendingNotif, setSendingNotif] = useState(false);

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
            unreadNotificationsCount: Number(data.unreadNotificationsCount ?? 0),
            totalNotificationsCount: Number(data.totalNotificationsCount ?? 0),
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
        list.sort((a, b) => (b.createdAt || b.updatedAt || '').localeCompare(a.createdAt || a.updatedAt || ''));
        setUsers(list);
        if (list.length > 0) {
          setInspectUserId((prev) => prev || list[0].userId);
        }
        setUsersLoading(false);
      },
      (err) => {
        console.error('Error listening to users:', err);
        setUsersLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 2. Subscribe to custom letterTemplates in Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'letterTemplates'),
      (snap) => {
        const customList: LetterTemplateRecord[] = [];
        snap.forEach((d) => {
          customList.push(d.data() as LetterTemplateRecord);
        });
        const merged = [
          ...DEFAULT_LETTER_TEMPLATES,
          ...customList.filter((c) => !DEFAULT_LETTER_TEMPLATES.some((def) => def.id === c.id)),
        ];
        setSavedTemplates(merged);
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // 3. Subscribe to all chat sessions in real time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'chats'),
      (snap) => {
        const list: ChatSession[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as ChatSession), userId: d.id });
        });
        list.sort((a, b) =>
          (b.lastMessageAt || b.updatedAt || '').localeCompare(a.lastMessageAt || a.updatedAt || '')
        );
        setChatSessions(list);
      },
      (err) => {
        console.warn('Error listening to chats:', err);
      }
    );
    return () => unsub();
  }, []);

  // 3b. Auto-reconcile any client who initiated a chat session if their /users/{userId} doc was missing
  useEffect(() => {
    if (usersLoading || chatSessions.length === 0) return;
    chatSessions.forEach((session) => {
      if (!session.userId) return;
      const existsInUsers = users.some((u) => u.userId === session.userId);
      if (!existsInUsers && (session.userEmail || session.userName)) {
        const nameParts = (session.userName || '').trim().split(' ').filter(Boolean);
        const now = new Date().toISOString();
        setDoc(
          doc(db, 'users', session.userId),
          {
            userId: session.userId,
            email: (session.userEmail || '').toLowerCase(),
            firstName: nameParts[0] || 'Investor',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: '+1 (555) 000-0000',
            totalBalance: 0,
            investedAmount: 0,
            cashBalance: 0,
            returnsAmount: 0,
            unreadNotificationsCount: 0,
            totalNotificationsCount: 0,
            role: 'client',
            status: 'active',
            kycStatus: 'verified',
            assignedAgentId: session.selectedAgentId || 'AG-001',
            assignedAgentName: session.selectedAgentName || 'Sarah Jenkins',
            createdAt: session.updatedAt || now,
            updatedAt: now,
          },
          { merge: true }
        ).catch(() => {});
      }
    });
  }, [chatSessions, users, usersLoading]);

  // 4. Subscribe to messages of the currently selected client chat
  useEffect(() => {
    if (!selectedChatUserId) {
      setChatMessages([]);
      return;
    }

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

  // 5. Subscribe in real time to the inspected user's notifications (and keep their profile counters synced with 0 lag)
  useEffect(() => {
    if (!inspectUserId) {
      setInspectedUserNotifs([]);
      return;
    }
    const notifRef = collection(db, 'users', inspectUserId, 'notifications');
    const unsub = onSnapshot(
      notifRef,
      (snap) => {
        const list: UserNotificationItem[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as UserNotificationItem), id: d.id });
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setInspectedUserNotifs(list);

        const unreadCount = list.filter((n) => !n.read).length;
        const totalCount = list.length;
        const targetUser = users.find((u) => u.userId === inspectUserId);
        if (
          targetUser &&
          (targetUser.unreadNotificationsCount !== unreadCount ||
            targetUser.totalNotificationsCount !== totalCount)
        ) {
          setDoc(
            doc(db, 'users', inspectUserId),
            {
              userId: inspectUserId,
              email: targetUser.email,
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
  }, [inspectUserId, users]);

  // 6. Subscribe to system adminConfig passcode
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

  // Helper to sync a user's notification counts accurately after creating/updating/deleting notifications
  const syncUserNotificationCounters = async (uid: string, emailFallback: string) => {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'notifications'));
      let unread = 0;
      snap.forEach((d) => {
        if (!d.data()?.read) unread += 1;
      });
      await setDoc(
        doc(db, 'users', uid),
        {
          userId: uid,
          email: emailFallback,
          unreadNotificationsCount: unread,
          totalNotificationsCount: snap.size,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Counter sync warning:', e);
    }
  };

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
        unreadNotificationsCount: 0,
        totalNotificationsCount: 0,
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
        totalBalance: 0,
        investedAmount: 0,
        cashBalance: 0,
        returnsAmount: 0,
        role: 'client',
        status: 'active',
        kycStatus: 'verified',
        assignedAgentId: 'AG-001',
        notes: '',
      });
      showNotification(
        `Account provisioned for ${cleanEmail} with $${profileData.totalBalance.toLocaleString()} balance.`
      );
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
      showNotification(
        `Real-time profile and balances updated for ${updatedProfile.firstName || updatedProfile.email}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${editingUser.userId}`);
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete Single User Account
  const handleDeleteUser = async (u: UserProfile) => {
    try {
      for (const sub of ['transactions', 'policies', 'cards', 'notifications']) {
        const subSnap = await getDocs(collection(db, 'users', u.userId, sub));
        for (const s of subSnap.docs) {
          await deleteDoc(doc(db, 'users', u.userId, sub, s.id));
        }
      }
      const msgsSnap = await getDocs(collection(db, 'chats', u.userId, 'messages'));
      for (const m of msgsSnap.docs) {
        await deleteDoc(doc(db, 'chats', u.userId, 'messages', m.id));
      }
      await deleteDoc(doc(db, 'chats', u.userId)).catch(() => {});
      await deleteDoc(doc(db, 'users', u.userId));
      showNotification(`Removed client account ${u.email}.`);
      if (editingUser?.userId === u.userId) setEditingUser(null);
      if (selectedChatUserId === u.userId) setSelectedChatUserId(null);
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
        for (const sub of ['transactions', 'policies', 'cards', 'notifications']) {
          const subSnap = await getDocs(collection(db, 'users', d.id, sub));
          for (const s of subSnap.docs) {
            await deleteDoc(doc(db, 'users', d.id, sub, s.id));
          }
        }
        await deleteDoc(doc(db, 'users', d.id));
      }
      const chatsSnap = await getDocs(collection(db, 'chats'));
      for (const c of chatsSnap.docs) {
        const msgsSnap = await getDocs(collection(db, 'chats', c.id, 'messages'));
        for (const m of msgsSnap.docs) {
          await deleteDoc(doc(db, 'chats', c.id, 'messages', m.id));
        }
        await deleteDoc(doc(db, 'chats', c.id));
      }
      const adminsSnap = await getDocs(collection(db, 'admins'));
      for (const d of adminsSnap.docs) {
        await deleteDoc(doc(db, 'admins', d.id));
      }
      setSelectedChatUserId(null);
      setShowPurgeConfirm(false);
      showNotification(
        `Successfully purged ${usersSnap.size} accounts and all chat threads from Firestore.`
      );
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

  // Approve & Credit a Client's Funding Request directly from Chat
  const handleApproveFundingRequest = async (msg: ChatMessage) => {
    if (!selectedChatUserId || !msg.fundingAmount) return;
    const targetUser = users.find((u) => u.userId === selectedChatUserId);
    if (!targetUser) return;

    const amountToCredit = Number(msg.fundingAmount);
    const now = new Date().toISOString();
    const chosenAgent = agents.find((a) => a.id === respondAsAgentId) || agents[0];

    try {
      // 1. Credit user's cashBalance & totalBalance
      const newCash = Number(targetUser.cashBalance || 0) + amountToCredit;
      const newTotal = Number(targetUser.totalBalance || 0) + amountToCredit;
      await setDoc(
        doc(db, 'users', selectedChatUserId),
        {
          userId: selectedChatUserId,
          email: targetUser.email,
          cashBalance: newCash,
          totalBalance: newTotal,
          updatedAt: now,
        },
        { merge: true }
      );

      // 2. Record completed deposit transaction
      const txId = `tx_approved_${Date.now()}`;
      await setDoc(doc(db, 'users', selectedChatUserId, 'transactions', txId), {
        id: txId,
        userId: selectedChatUserId,
        type: 'deposit',
        amount: amountToCredit,
        assetName: `Approved Deposit (${msg.fundingOrigin || 'Funding Agent Desk'})`,
        status: 'completed',
        timestamp: now,
      });

      // 3. Send Official Confirmation Letter in Chat
      const confirmMsgId = `msg_${Date.now()}`;
      const confirmRef = `SVC-DEP-${Math.floor(100000 + Math.random() * 900000)}`;
      const confirmText = `Your funding deposit of $${amountToCredit.toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })} USD from ${msg.fundingOrigin || 'your designated source'} (${
        msg.fundingReason || 'Vault Deposit'
      }) has been verified and credited to your available Vault Cash Balance.`;

      await setDoc(doc(db, 'chats', selectedChatUserId, 'messages', confirmMsgId), {
        id: confirmMsgId,
        userId: selectedChatUserId,
        senderRole: 'admin',
        senderName: chosenAgent?.name || 'Sarah Jenkins',
        agentId: chosenAgent?.id || 'AG-001',
        agentName: chosenAgent?.name || 'Sarah Jenkins',
        agentRole: chosenAgent?.role || 'Fiduciary Specialist',
        agentAvatar: chosenAgent?.img || '',
        messageType: 'letter',
        letterCategory: 'Deposit Settlement Confirmation',
        letterTitle: `Funds Credited: +$${amountToCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        letterReference: confirmRef,
        text: confirmText,
        createdAt: now,
      });

      const chatSnap = await getDoc(doc(db, 'chats', selectedChatUserId));
      const prevUnreadClient = chatSnap.exists() ? Number(chatSnap.data()?.unreadByClient || 0) : 0;

      await setDoc(
        doc(db, 'chats', selectedChatUserId),
        {
          userId: selectedChatUserId,
          lastMessage: `Funds Credited: +$${amountToCredit.toLocaleString()}`,
          lastMessageAt: now,
          unreadByAdmin: 0,
          unreadByClient: prevUnreadClient + 1,
          updatedAt: now,
        },
        { merge: true }
      );

      // 4. Create Real-time Notification for the client
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'users', selectedChatUserId, 'notifications', notifId), {
        id: notifId,
        userId: selectedChatUserId,
        title: `Deposit Credited: +$${amountToCredit.toLocaleString()}`,
        message: confirmText,
        category: 'funding',
        priority: 'high',
        read: false,
        requiresChatOpen: true,
        senderAgentName: chosenAgent?.name || 'Fiduciary Desk',
        referenceCode: confirmRef,
        createdAt: now,
      });
      await syncUserNotificationCounters(selectedChatUserId, targetUser.email);

      showNotification(
        `Credited $${amountToCredit.toLocaleString()} to ${targetUser.firstName || targetUser.email} and dispatched confirmation.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${selectedChatUserId}`);
    }
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
        messageType: 'text',
        text: replyText.trim(),
        createdAt: now,
      };

      await setDoc(doc(db, 'chats', selectedChatUserId, 'messages', msgId), newMsg);

      const sessionUpdate: ChatSession = {
        userId: selectedChatUserId,
        userEmail: currentSession?.userEmail || targetUser?.email || '',
        userName:
          currentSession?.userName ||
          `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() ||
          'Client',
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

  // Select a Template in the Letter / Invoice / Alert Composer
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = savedTemplates.find((t) => t.id === tplId);
    if (!tpl) return;
    setLetterType(tpl.templateType);
    setLetterCategory(tpl.category);
    setLetterTitle(tpl.title);
    setLetterBody(tpl.body);
    if (tpl.defaultAmount) {
      setInvoiceAmount(String(tpl.defaultAmount));
    }
    setLetterReference(
      tpl.templateType === 'invoice'
        ? `SVC-INV-${Math.floor(100000 + Math.random() * 900000)}`
        : tpl.templateType === 'account_alert'
        ? `SVC-ALT-${Math.floor(100000 + Math.random() * 900000)}`
        : `SVC-LTR-${Math.floor(100000 + Math.random() * 900000)}`
    );
  };

  // Send Official Letter / Invoice / Specific Account Alert into Client Chat + Trigger Notification
  const handleSendOfficialLetter = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserId || !letterTitle.trim() || !letterBody.trim()) return;
    setSendingLetter(true);

    try {
      const now = new Date().toISOString();
      const chosenAgent = agents.find((a) => a.id === respondAsAgentId) || agents[0];
      const targetUser = users.find((u) => u.userId === selectedChatUserId);
      const currentSession = chatSessions.find((c) => c.userId === selectedChatUserId);

      // Optional: Save as reusable custom template if requested
      if (saveAsNewTemplateName.trim()) {
        const newTplId = `TPL-CUSTOM-${Date.now()}`;
        const newTpl: LetterTemplateRecord = {
          id: newTplId,
          name: saveAsNewTemplateName.trim(),
          templateType: letterType,
          category: letterCategory.trim() || 'Official Notice',
          title: letterTitle.trim(),
          body: letterBody.trim(),
          defaultAmount: letterType === 'invoice' ? Number(invoiceAmount) || 0 : 0,
          createdAt: now,
        };
        await setDoc(doc(db, 'letterTemplates', newTplId), newTpl);
      }

      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const parsedAmount = letterType === 'invoice' ? Number(invoiceAmount) || 0 : 0;

      const letterMsg: ChatMessage = {
        id: msgId,
        userId: selectedChatUserId,
        senderRole: 'admin',
        senderName: chosenAgent?.name || 'Sarah Jenkins',
        agentId: chosenAgent?.id || 'AG-001',
        agentName: chosenAgent?.name || 'Sarah Jenkins',
        agentRole: chosenAgent?.role || 'Senior Fiduciary Advisor',
        agentAvatar: chosenAgent?.img || '',
        messageType: letterType,
        letterTitle: letterTitle.trim(),
        letterCategory: letterCategory.trim(),
        letterReference: letterReference.trim(),
        invoiceAmount: parsedAmount,
        invoiceDueDate: letterType === 'invoice' ? invoiceDueDate : '',
        requiresAction: true,
        text: letterBody.trim(),
        createdAt: now,
      };

      await setDoc(doc(db, 'chats', selectedChatUserId, 'messages', msgId), letterMsg);

      const sessionUpdate: ChatSession = {
        userId: selectedChatUserId,
        userEmail: currentSession?.userEmail || targetUser?.email || '',
        userName:
          currentSession?.userName ||
          `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() ||
          'Client',
        selectedAgentId: chosenAgent?.id || 'AG-001',
        selectedAgentName: chosenAgent?.name || 'Sarah Jenkins',
        selectedAgentRole: chosenAgent?.role || 'Senior Fiduciary Advisor',
        selectedAgentAvatar: chosenAgent?.img || '',
        lastMessage: `[${letterCategory}] ${letterTitle.trim()}`,
        lastMessageAt: now,
        unreadByAdmin: 0,
        unreadByClient: (currentSession?.unreadByClient || 0) + 1,
        updatedAt: now,
      };
      await setDoc(doc(db, 'chats', selectedChatUserId), sessionUpdate, { merge: true });

      // Automatically dispatch a real-time User Notification requiring personal chat opening
      const notifId = `notif_${Date.now()}`;
      const notifCategory: UserNotificationItem['category'] =
        letterType === 'invoice'
          ? 'invoice'
          : letterType === 'account_alert'
          ? 'account_alert'
          : 'system';

      await setDoc(doc(db, 'users', selectedChatUserId, 'notifications', notifId), {
        id: notifId,
        userId: selectedChatUserId,
        title: letterTitle.trim(),
        message: `${letterBody.trim()}\n\n[Click "Open Personal Chat" to review and respond directly to ${
          chosenAgent?.name || 'your advisor'
        }.]`,
        category: notifCategory,
        priority: letterType === 'account_alert' ? 'critical' : 'high',
        read: false,
        requiresChatOpen: true,
        senderAgentName: chosenAgent?.name || 'Summit Vault Fiduciary Desk',
        referenceCode: letterReference.trim(),
        invoiceAmount: parsedAmount,
        createdAt: now,
      });

      if (targetUser) {
        await syncUserNotificationCounters(selectedChatUserId, targetUser.email);
      }

      setShowLetterModal(false);
      setSaveAsNewTemplateName('');
      showNotification(
        `Dispatched ${letterCategory} (${letterReference}) to client chat and triggered real-time Account Notification.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${selectedChatUserId}`);
    } finally {
      setSendingLetter(false);
    }
  };

  // Dispatch Notification from the Admin Notifications Manager (Individual User OR Broadcast All Users)
  const handleDispatchNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.message.trim()) return;
    setSendingNotif(true);

    try {
      const now = new Date().toISOString();
      const targetList =
        selectedNotifUserId === 'ALL'
          ? users
          : users.filter((u) => u.userId === selectedNotifUserId);

      if (targetList.length === 0) {
        showNotification('No target user accounts found.', 'error');
        setSendingNotif(false);
        return;
      }

      const parsedAmt = notifForm.invoiceAmount ? Number(notifForm.invoiceAmount) || 0 : 0;

      for (const u of targetList) {
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const assignedAg = agents.find((a) => a.id === u.assignedAgentId) || agents[0];

        await setDoc(doc(db, 'users', u.userId, 'notifications', notifId), {
          id: notifId,
          userId: u.userId,
          title: notifForm.title.trim(),
          message: notifForm.message.trim(),
          category: notifForm.category,
          priority: notifForm.priority,
          read: false,
          requiresChatOpen: notifForm.requiresChatOpen,
          senderAgentName: assignedAg?.name || 'Summit Vault Fiduciary Desk',
          referenceCode: notifForm.referenceCode.trim(),
          invoiceAmount: parsedAmt,
          createdAt: now,
        });

        // If "Also post into client's Personal Chat" is checked, post the official alert/invoice card into their chat thread too
        if (notifForm.alsoSendToChat) {
          const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const msgType: ChatMessage['messageType'] =
            notifForm.category === 'invoice'
              ? 'invoice'
              : notifForm.category === 'account_alert' || notifForm.category === 'security'
              ? 'account_alert'
              : 'letter';

          await setDoc(doc(db, 'chats', u.userId, 'messages', msgId), {
            id: msgId,
            userId: u.userId,
            senderRole: 'admin',
            senderName: assignedAg?.name || 'Sarah Jenkins',
            agentId: assignedAg?.id || 'AG-001',
            agentName: assignedAg?.name || 'Sarah Jenkins',
            agentRole: assignedAg?.role || 'Fiduciary Specialist',
            agentAvatar: assignedAg?.img || '',
            messageType: msgType,
            letterTitle: notifForm.title.trim(),
            letterCategory:
              notifForm.category === 'invoice'
                ? 'Official Vault Invoice'
                : notifForm.category === 'account_alert'
                ? 'Account Alert (Action Required)'
                : 'Fiduciary Notice',
            letterReference: notifForm.referenceCode.trim(),
            invoiceAmount: parsedAmt,
            requiresAction: notifForm.requiresChatOpen,
            text: notifForm.message.trim(),
            createdAt: now,
          });

          const existingChat = chatSessions.find((c) => c.userId === u.userId);
          await setDoc(
            doc(db, 'chats', u.userId),
            {
              userId: u.userId,
              userEmail: u.email,
              userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
              selectedAgentId: assignedAg?.id || 'AG-001',
              selectedAgentName: assignedAg?.name || 'Sarah Jenkins',
              selectedAgentRole: assignedAg?.role || 'Fiduciary Specialist',
              selectedAgentAvatar: assignedAg?.img || '',
              lastMessage: `[Alert] ${notifForm.title.trim()}`,
              lastMessageAt: now,
              unreadByClient: (existingChat?.unreadByClient || 0) + 1,
              updatedAt: now,
            },
            { merge: true }
          );
        }

        await syncUserNotificationCounters(u.userId, u.email);
      }

      if (selectedNotifUserId !== 'ALL') {
        setInspectUserId(selectedNotifUserId);
      }

      setNotifForm({
        ...notifForm,
        title: '',
        message: '',
        invoiceAmount: '',
        referenceCode: `ALT-${Math.floor(10000 + Math.random() * 90000)}`,
      });

      showNotification(
        selectedNotifUserId === 'ALL'
          ? `Broadcasted notification to all ${targetList.length} client account(s) in real time.`
          : `Dispatched notification to ${targetList[0].firstName || targetList[0].email} in real time.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users/notifications');
    } finally {
      setSendingNotif(false);
    }
  };

  const handleAdminToggleNotifRead = async (notif: UserNotificationItem) => {
    const targetUser = users.find((u) => u.userId === notif.userId);
    try {
      await updateDoc(doc(db, 'users', notif.userId, 'notifications', notif.id), {
        read: !notif.read,
        readAt: !notif.read ? new Date().toISOString() : '',
      });
      if (targetUser) {
        await syncUserNotificationCounters(notif.userId, targetUser.email);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${notif.userId}/notifications/${notif.id}`);
    }
  };

  const handleAdminDeleteNotif = async (notif: UserNotificationItem) => {
    const targetUser = users.find((u) => u.userId === notif.userId);
    try {
      await deleteDoc(doc(db, 'users', notif.userId, 'notifications', notif.id));
      if (targetUser) {
        await syncUserNotificationCounters(notif.userId, targetUser.email);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${notif.userId}/notifications/${notif.id}`);
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
        adminEmail: OFFICIAL_ADMIN_EMAIL,
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
  const totalUnreadNotifsAcrossUsers = users.reduce(
    (sum, u) => sum + (Number(u.unreadNotificationsCount) || 0),
    0
  );
  const activeChatSession = chatSessions.find((c) => c.userId === selectedChatUserId);
  const activeChatUser = users.find((u) => u.userId === selectedChatUserId);
  const inspectedUserObj = users.find((u) => u.userId === inspectUserId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <Logo dark />
            </Link>
            <div className="hidden xl:flex flex-col">
              <span className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Master Admin Command
              </span>
              <span className="text-[11px] font-mono text-slate-400">{OFFICIAL_ADMIN_EMAIL}</span>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clients & Balances</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-950/20 font-bold font-mono tabular-nums">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'chats'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>2-Way Chats & Letters</span>
              {totalUnreadChats > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500 text-white font-bold font-mono tabular-nums">
                  {totalUnreadChats}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications Center</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-950/25 font-bold font-mono tabular-nums">
                {totalUnreadNotifsAcrossUsers} Unread
              </span>
            </button>

            <button
              onClick={() => setActiveTab('agents')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white font-mono tabular-nums">
              {users.length}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Zero-Lag Firestore Sync</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Client Ledger Total Balance</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white font-mono tabular-nums">
              ${totalClientBalances.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Instant real-time balance reflection</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Active Client Chat Threads</span>
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white font-mono tabular-nums">
              {chatSessions.length}
            </div>
            <div className="text-[11px] text-amber-400 mt-1">
              {totalUnreadChats > 0 ? `${totalUnreadChats} unread message(s)` : 'Funding & advisor threads live'}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Live Client Notifications</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-white font-mono tabular-nums">
              {totalUnreadNotifsAcrossUsers} <span className="text-sm font-normal text-slate-400">Unread</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Real-time read/unread status tracking</div>
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
                      <th className="p-4">Liquid Cash</th>
                      <th className="p-4">Notifications</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          Synchronizing live client vaults from Firestore...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
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
                      filteredUsers.map((u) => {
                        const unreadN = Number(u.unreadNotificationsCount || 0);
                        const totalN = Number(u.totalNotificationsCount || 0);
                        const readN = Math.max(0, totalN - unreadN);
                        return (
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

                            <td className="p-4">
                              <div className="font-bold text-white text-base font-mono tabular-nums">
                                ${Number(u.totalBalance || 0).toLocaleString()}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                                Inv: ${Number(u.investedAmount || 0).toLocaleString()} · Ret: +${Number(u.returnsAmount || 0).toLocaleString()}
                              </div>
                            </td>

                            <td className="p-4 text-slate-300 font-mono tabular-nums">
                              ${Number(u.cashBalance || 0).toLocaleString()}
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setInspectUserId(u.userId);
                                  setSelectedNotifUserId(u.userId);
                                  setActiveTab('notifications');
                                }}
                                className="text-left group cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      unreadN > 0
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {unreadN} Unread
                                  </span>
                                  <span className="text-slate-400">{readN} Read</span>
                                </div>
                                <div className="text-[10px] text-amber-400 group-hover:underline mt-1">
                                  Manage Alerts ({totalN}) →
                                </div>
                              </button>
                            </td>

                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingUser({ ...u })}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit Balances
                                </button>
                                <button
                                  onClick={() => openChatForUser(u)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Open 2-Way Chat & Send Letters/Invoices"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Chat & Letters
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: 2-WAY LIVE CLIENT CHATS & LETTER TEMPLATES ==================== */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[640px]">
            {/* Left Sidebar: All Client Conversations & Client Roster */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h2 className="text-base font-bold text-white flex items-center justify-between">
                  <span>All Client Conversations</span>
                  <span className="text-xs font-normal text-amber-400">Funnels All Agents</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every funding request & advisor message routes here in real time.
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
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono tabular-nums">
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

            {/* Right Column: Active 2-Way Conversation, Letter Templates & Agent Persona Switcher */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
              {selectedChatUserId ? (
                <>
                  {/* Conversation Header with Agent Persona Selector & Official Letter Button */}
                  <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
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
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>
                          Speaking with:{' '}
                          <strong className="text-amber-400">
                            {activeChatSession?.selectedAgentName || 'Sarah Jenkins'}
                          </strong>
                        </span>
                        {activeChatUser && (
                          <span className="font-mono text-emerald-400 tabular-nums">
                            Cash: ${Number(activeChatUser.cashBalance || 0).toLocaleString()} · Total: $
                            {Number(activeChatUser.totalBalance || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Issue Official Letter / Invoice / Alert Button */}
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTemplate(savedTemplates[0].id);
                          setShowLetterModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Create Letter / Invoice / Alert</span>
                      </button>

                      {/* Admin "Respond As Agent" Selector */}
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                          Respond As:
                        </span>
                        <select
                          value={respondAsAgentId}
                          onChange={(e) => setRespondAsAgentId(e.target.value)}
                          className="bg-transparent text-amber-300 font-semibold text-xs focus:outline-none cursor-pointer"
                        >
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id} className="bg-slate-900 text-white">
                              {ag.name} ({ag.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/30">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                        <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-400 font-medium">No messages in this thread yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          Send a message below or click "Create Letter / Invoice / Alert" above to issue an official document to this client.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isAdminMsg = msg.senderRole === 'admin';
                        const isFundingReq = msg.messageType === 'funding_request';
                        const isInvoice = msg.messageType === 'invoice';
                        const isAlert = msg.messageType === 'account_alert';
                        const isLetter = msg.messageType === 'letter';

                        if (isFundingReq) {
                          return (
                            <div key={msg.id} className="flex flex-col items-start">
                              <div className="text-[11px] text-emerald-400 font-semibold mb-1 px-1">
                                {msg.senderName || 'Client'} · Routed to Funding Agent ({msg.agentName})
                              </div>
                              <div className="w-full max-w-xl rounded-2xl bg-slate-900 border-2 border-amber-500/50 p-5 text-white shadow-xl">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                    <ArrowDownLeft className="w-4 h-4" /> Client Deposit / Funding Request
                                  </span>
                                  <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                                    ${Number(msg.fundingAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-xs sm:text-sm mb-4">
                                  <div>
                                    <span className="text-slate-400">Depositing From: </span>
                                    <span className="font-semibold text-white">{msg.fundingOrigin}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Reason for Deposit: </span>
                                    <span className="font-semibold text-white">{msg.fundingReason}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveFundingRequest(msg)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve & Credit ${Number(msg.fundingAmount || 0).toLocaleString()}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLetterType('invoice');
                                      setLetterCategory('Official Vault Deposit Invoice');
                                      setLetterTitle(`Deposit Settlement Invoice — ${msg.fundingOrigin}`);
                                      setInvoiceAmount(String(msg.fundingAmount || 0));
                                      setLetterReference(`SVC-INV-${Math.floor(100000 + Math.random() * 900000)}`);
                                      setLetterBody(
                                        `OFFICIAL DEPOSIT SETTLEMENT INVOICE\n\nOrigin: ${msg.fundingOrigin}\nPurpose: ${msg.fundingReason}\nAmount Due: $${Number(
                                          msg.fundingAmount || 0
                                        ).toLocaleString('en-US', {
                                          minimumFractionDigits: 2,
                                        })} USD\n\nPlease complete your transfer according to the settlement instructions provided in this thread. Once remitted, confirm here for immediate vault balance credit.`
                                      );
                                      setShowLetterModal(true);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    Send Official Deposit Invoice
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (isInvoice || isAlert || isLetter) {
                          return (
                            <div key={msg.id} className="flex flex-col items-end">
                              <div className="text-[11px] text-amber-400 font-semibold mb-1 px-1">
                                Official {msg.letterCategory} Sent as {msg.agentName} · Ref: {msg.letterReference}
                              </div>
                              <div className="w-full max-w-xl rounded-2xl bg-slate-950 border border-amber-500/40 p-4 text-slate-200 shadow-lg">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                    {msg.letterCategory}
                                  </span>
                                  {typeof msg.invoiceAmount === 'number' && msg.invoiceAmount > 0 && (
                                    <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                                      Amount Due: ${msg.invoiceAmount.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                {msg.letterTitle && (
                                  <div className="font-bold text-white text-sm mb-1.5">{msg.letterTitle}</div>
                                )}
                                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                                  {msg.text}
                                </p>
                              </div>
                            </div>
                          );
                        }

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
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
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
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                            <div
                              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
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

                  {/* Quick Template Bar + Admin Reply Composer */}
                  <div className="border-t border-slate-800 bg-slate-900 p-4 space-y-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Templates:
                      </span>
                      {savedTemplates.slice(0, 4).map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            handleSelectTemplate(tpl.id);
                            setShowLetterModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 font-medium whitespace-nowrap cursor-pointer"
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSendAdminReply} className="flex items-end gap-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to client as ${
                          agents.find((a) => a.id === respondAsAgentId)?.name || 'Advisor'
                        }...`}
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
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">Select a Client Conversation</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Pick any client from the left panel to view funding requests, respond as any Accredited Agent, or issue Official Invoices & Account Alerts.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: NOTIFICATIONS CENTER (ALL & PER-USER) ==================== */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Dispatch Notification to Individual User or Broadcast to All */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 self-start">
              <div>
                <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>Dispatch Account Notification / Alert</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Send real-time notifications or specific account alerts to an individual client or broadcast to all users.
                </p>
              </div>

              <form onSubmit={handleDispatchNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Recipient(s) *
                  </label>
                  <select
                    value={selectedNotifUserId}
                    onChange={(e) => {
                      setSelectedNotifUserId(e.target.value);
                      if (e.target.value !== 'ALL') {
                        setInspectUserId(e.target.value);
                      }
                    }}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="ALL">Broadcast to ALL Registered Users ({users.length})</option>
                    {users.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Client'} ({u.email}) —{' '}
                        {u.unreadNotificationsCount || 0} Unread
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Alert Category *
                    </label>
                    <select
                      value={notifForm.category}
                      onChange={(e) =>
                        setNotifForm({
                          ...notifForm,
                          category: e.target.value as UserNotificationItem['category'],
                        })
                      }
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm"
                    >
                      <option value="account_alert">Specific Account Alert</option>
                      <option value="invoice">Official Invoice Notice</option>
                      <option value="security">Security Protocol Alert</option>
                      <option value="funding">Funding / Deposit Update</option>
                      <option value="system">General Fiduciary Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={notifForm.priority}
                      onChange={(e) =>
                        setNotifForm({
                          ...notifForm,
                          priority: e.target.value as 'critical' | 'high' | 'normal',
                        })
                      }
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm"
                    >
                      <option value="critical">Critical (Red)</option>
                      <option value="high">High (Amber)</option>
                      <option value="normal">Standard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Reference Code
                    </label>
                    <input
                      type="text"
                      value={notifForm.referenceCode}
                      onChange={(e) => setNotifForm({ ...notifForm, referenceCode: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Invoice Amount ($ Optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={notifForm.invoiceAmount}
                      onChange={(e) => setNotifForm({ ...notifForm, invoiceAmount: e.target.value })}
                      placeholder="0.00"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Notification Headline / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    placeholder="e.g. Action Required: Security Clearance & Personal Chat Verification"
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Directive / Message Body *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={notifForm.message}
                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    placeholder="Enter the official notification or account alert message..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm resize-none"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.requiresChatOpen}
                      onChange={(e) =>
                        setNotifForm({ ...notifForm, requiresChatOpen: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-950 text-amber-500"
                    />
                    <span>Require Personal Chat Opening when client clicks this alert</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.alsoSendToChat}
                      onChange={(e) =>
                        setNotifForm({ ...notifForm, alsoSendToChat: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-950 text-amber-500"
                    />
                    <span>Also post as an Official Document Card inside the client's Chat Box</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sendingNotif || users.length === 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {sendingNotif
                    ? 'Dispatching Live...'
                    : selectedNotifUserId === 'ALL'
                    ? `Broadcast Alert to All (${users.length}) Users`
                    : 'Dispatch Alert to Selected User'}
                </button>
              </form>
            </div>

            {/* Right Column: Live Per-User Notification Inspector & Read/Unread Counter Control */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-heading text-white">
                    Per-User Live Notification Feed & Read/Unread Monitor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Zero-lag synchronization of notification numbers before and after being read by the user.
                  </p>
                </div>
                <select
                  value={inspectUserId}
                  onChange={(e) => setInspectUserId(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-amber-300 font-semibold"
                >
                  {users.length === 0 && <option value="">No users registered</option>}
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email} ({u.unreadNotificationsCount || 0}{' '}
                      Unread / {u.totalNotificationsCount || 0} Total)
                    </option>
                  ))}
                </select>
              </div>

              {inspectedUserObj && (
                <div className="grid grid-cols-3 gap-3 my-5">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
                    <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
                      Unread Count (Before Read)
                    </div>
                    <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                      {inspectedUserNotifs.filter((n) => !n.read).length}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                      Read Count (After Read)
                    </div>
                    <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                      {inspectedUserNotifs.filter((n) => n.read).length}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Total Notifications
                    </div>
                    <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                      {inspectedUserNotifs.length}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 max-h-[520px] pr-1">
                {!inspectUserId || inspectedUserNotifs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No notifications recorded for this user yet. Use the form on the left to dispatch an alert or invoice notice.
                  </div>
                ) : (
                  inspectedUserNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        !n.read
                          ? 'bg-slate-950 border-amber-500/40'
                          : 'bg-slate-950/50 border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm">{n.title}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                !n.read
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {!n.read ? 'UNREAD' : 'READ BY USER'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {n.category} {n.referenceCode ? `· ${n.referenceCode}` : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                            {n.message}
                          </p>
                          <div className="text-[11px] text-slate-500 pt-1 font-mono tabular-nums">
                            Sent: {new Date(n.createdAt).toLocaleString()}
                            {n.read && n.readAt ? ` · Read at: ${new Date(n.readAt).toLocaleTimeString()}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAdminToggleNotifRead(n)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 cursor-pointer"
                            title="Toggle Read / Unread Status"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{n.read ? 'Mark Unread' : 'Mark Read'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminDeleteNotif(n)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                            title="Delete Notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: MANAGE AGENTS ==================== */}
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

        {/* ==================== TAB 5: ADMIN SETTINGS (PASSCODE & ADMIN MAIL) ==================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading text-white">Master Admin Security Settings</h2>
                <p className="text-xs text-slate-400">
                  Official Admin Mail: <span className="text-amber-400 font-mono">{OFFICIAL_ADMIN_EMAIL}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Official Master Admin Email</div>
                <div className="text-sm sm:text-base font-mono font-bold text-white mt-0.5">
                  {OFFICIAL_ADMIN_EMAIL}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                Primary Governance Mail
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Active Admin Passcode</div>
                <div className="text-lg font-mono font-bold text-amber-400 tracking-widest mt-0.5 tabular-nums">
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

      {/* ==================== MODAL: OFFICIAL LETTER / INVOICE / ACCOUNT ALERT COMPOSER ==================== */}
      <AnimatePresence>
        {showLetterModal && selectedChatUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLetterModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl z-10 my-8 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    Fiduciary Document & Alert Generator
                  </span>
                  <h3 className="text-xl font-bold font-heading text-white mt-0.5">
                    Issue Official Letter, Invoice, or Account Alert
                  </h3>
                </div>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendOfficialLetter} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Load Official Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 text-xs sm:text-sm font-semibold"
                  >
                    {savedTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        [{tpl.templateType.toUpperCase()}] {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Document Classification *</label>
                    <select
                      value={letterType}
                      onChange={(e) =>
                        setLetterType(e.target.value as 'invoice' | 'account_alert' | 'letter')
                      }
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm"
                    >
                      <option value="invoice">Official Invoice</option>
                      <option value="account_alert">Specific Account Alert (Needs Chat Open)</option>
                      <option value="letter">Official Fiduciary Letter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Alert / Document Category *</label>
                    <input
                      type="text"
                      required
                      value={letterCategory}
                      onChange={(e) => setLetterCategory(e.target.value)}
                      placeholder="e.g. Security Protocol Alert"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Reference / Invoice # *</label>
                    <input
                      type="text"
                      required
                      value={letterReference}
                      onChange={(e) => setLetterReference(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>

                {letterType === 'invoice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30">
                    <div>
                      <label className="block text-xs text-amber-400 font-semibold mb-1">
                        Invoice Amount Due (USD) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-bold font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Settlement Due Date</label>
                      <input
                        type="date"
                        value={invoiceDueDate}
                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Official Headline / Subject *</label>
                  <input
                    type="text"
                    required
                    value={letterTitle}
                    onChange={(e) => setLetterTitle(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Letter / Invoice / Alert Body *</label>
                  <textarea
                    rows={6}
                    required
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm leading-relaxed resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs text-slate-400 mb-1">
                    Save as Reusable Template (Optional — enter template name to save for future use)
                  </label>
                  <input
                    type="text"
                    value={saveAsNewTemplateName}
                    onChange={(e) => setSaveAsNewTemplateName(e.target.value)}
                    placeholder="e.g. Custom Margin Call Alert Template"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLetterModal(false)}
                    className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingLetter}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {sendingLetter
                        ? 'Dispatching Document...'
                        : 'Send to Client Chat & Trigger Alert Notification'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Invested ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.investedAmount}
                      onChange={(e) => setNewUserForm({ ...newUserForm, investedAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Liquid Cash ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.cashBalance}
                      onChange={(e) => setNewUserForm({ ...newUserForm, cashBalance: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-400 mb-1">Returns ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={newUserForm.returnsAmount}
                      onChange={(e) => setNewUserForm({ ...newUserForm, returnsAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono tabular-nums"
                    />
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tabular-nums border cursor-pointer ${
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
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Invested ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.investedAmount}
                      onChange={(e) => setEditingUser({ ...editingUser, investedAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Liquid Cash ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.cashBalance}
                      onChange={(e) => setEditingUser({ ...editingUser, cashBalance: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-400 mb-1">Returns ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editingUser.returnsAmount}
                      onChange={(e) => setEditingUser({ ...editingUser, returnsAmount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono tabular-nums"
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
                  <label className="block text-xs text-slate-400 mb-1">Biography</label>
                  <textarea
                    rows={3}
                    value={agentForm.bio}
                    onChange={(e) => setAgentForm({ ...agentForm, bio: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAgentModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm cursor-pointer"
                  >
                    Save Agent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL: PURGE ALL CONFIRMATION ==================== */}
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
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white mb-2">Purge All Client Accounts?</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                This will permanently remove all client profiles, balances, transactions, notifications, and chat threads from Firestore so your database is at 000 accounts. Active agents will be preserved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurgeConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium cursor-pointer"
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
