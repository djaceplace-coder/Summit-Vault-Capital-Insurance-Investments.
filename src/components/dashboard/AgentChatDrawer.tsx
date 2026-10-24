import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ShieldCheck, Receipt, ShieldAlert, FileText, ArrowDownLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, doc, getDoc, onSnapshot, query, orderBy, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useAgents } from '../../lib/agentsData';

export interface LiveMessage {
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

export function AgentChatDrawer({
  isOpen,
  onClose,
  prefilledMessage = '',
  forcedAgentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  prefilledMessage?: string;
  forcedAgentId?: string;
}) {
  const { user, profile } = useAuth();
  const { agents } = useAgents();
  const activeAgents = agents.filter((a) => a.status === 'Active');

  const [selectedAgentId, setSelectedAgentId] = useState<string>('AG-001');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAgent =
    activeAgents.find((a) => a.id === selectedAgentId) || activeAgents[0] || agents[0];

  useEffect(() => {
    if (forcedAgentId) {
      setSelectedAgentId(forcedAgentId);
    } else if (profile?.assignedAgentId) {
      setSelectedAgentId(profile.assignedAgentId);
    }
  }, [forcedAgentId, profile?.assignedAgentId]);

  useEffect(() => {
    if (prefilledMessage && isOpen) {
      setMessage(prefilledMessage);
    }
  }, [prefilledMessage, isOpen]);

  useEffect(() => {
    if (!user) return;

    const sessionRef = doc(db, 'chats', user.uid);
    const unsubSession = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.selectedAgentId && !forcedAgentId) {
          setSelectedAgentId(data.selectedAgentId);
        }
        if (isOpen && (data?.unreadByClient || 0) > 0) {
          updateDoc(sessionRef, { unreadByClient: 0 }).catch(() => {});
        }
      }
    });

    const q = query(collection(db, 'chats', user.uid, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMsgs = onSnapshot(q, (snap) => {
      const list: LiveMessage[] = [];
      snap.forEach((d) => {
        list.push(d.data() as LiveMessage);
      });
      setMessages(list);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    });

    return () => {
      unsubSession();
      unsubMsgs();
    };
  }, [user, isOpen, forcedAgentId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleAgentChange = async (newAgentId: string) => {
    setSelectedAgentId(newAgentId);
    if (!user) return;
    const chosen = agents.find((a) => a.id === newAgentId);
    if (!chosen) return;
    try {
      await setDoc(
        doc(db, 'chats', user.uid),
        {
          userId: user.uid,
          userEmail: profile?.email || user.email || '',
          userName:
            `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
            user.email ||
            'Client',
          selectedAgentId: chosen.id,
          selectedAgentName: chosen.name,
          selectedAgentRole: chosen.role,
          selectedAgentAvatar: chosen.img,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // ignore
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user || sending) return;
    const textToSend = message.trim();
    setMessage('');
    setSending(true);

    try {
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const clientName =
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
        user.email ||
        'Client';

      const newMsg: LiveMessage = {
        id: msgId,
        userId: user.uid,
        senderRole: 'client',
        senderName: clientName,
        agentId: currentAgent?.id || 'AG-001',
        agentName: currentAgent?.name || 'Sarah Jenkins',
        agentRole: currentAgent?.role || 'Wealth Specialist',
        agentAvatar: currentAgent?.img || '',
        messageType: 'text',
        text: textToSend,
        createdAt: now,
      };

      await setDoc(doc(db, 'chats', user.uid, 'messages', msgId), newMsg);

      const chatRef = doc(db, 'chats', user.uid);
      const chatSnap = await getDoc(chatRef);
      const prevUnreadAdmin = chatSnap.exists()
        ? Number(chatSnap.data()?.unreadByAdmin || 0)
        : 0;

      await setDoc(
        chatRef,
        {
          userId: user.uid,
          userEmail: profile?.email || user.email || '',
          userName: clientName,
          selectedAgentId: currentAgent?.id || 'AG-001',
          selectedAgentName: currentAgent?.name || 'Sarah Jenkins',
          selectedAgentRole: currentAgent?.role || 'Wealth Specialist',
          selectedAgentAvatar: currentAgent?.img || '',
          lastMessage: textToSend,
          lastMessageAt: now,
          unreadByAdmin: prevUnreadAdmin + 1,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${user.uid}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-100 shadow-2xl z-[80] flex flex-col"
          >
            {/* Header with Agent Selector */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {currentAgent?.img ? (
                      <img
                        src={currentAgent.img}
                        alt={currentAgent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-amber-400">
                        {currentAgent?.name?.[0] || 'A'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold leading-tight text-white">
                      {currentAgent?.name || 'Sarah Jenkins'}
                    </h3>
                    <div className="text-xs text-amber-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{currentAgent?.role || 'Fiduciary Specialist'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-full bg-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Choose Advisor Dropdown */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  Speak With:
                </span>
                <select
                  value={selectedAgentId}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-semibold text-amber-300 focus:outline-none cursor-pointer"
                >
                  {activeAgents.map((ag) => (
                    <option key={ag.id} value={ag.id} className="bg-slate-900 text-white">
                      {ag.name} — {ag.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              <div className="text-center text-[11px] text-slate-400 mb-4 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Encrypted 2-Way Fiduciary Channel</span>
              </div>

              {messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs">
                    <div className="text-[11px] font-bold text-amber-600 mb-1">
                      {currentAgent?.name || 'Sarah Jenkins'} · {currentAgent?.role}
                    </div>
                    <p className="text-sm leading-relaxed">
                      Welcome to Summit Vault Capital. I am {currentAgent?.name || 'your dedicated advisor'}. Send a message below to speak directly with our desk in real time.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                const isClient = msg.senderRole === 'client';
                const isFundingReq = msg.messageType === 'funding_request';
                const isInvoice = msg.messageType === 'invoice';
                const isAlert = msg.messageType === 'account_alert';
                const isLetter = msg.messageType === 'letter';

                if (isFundingReq) {
                  return (
                    <div key={msg.id} className="flex flex-col items-end">
                      <div className="w-full max-w-[92%] rounded-2xl bg-slate-900 text-white p-4 border border-amber-500/40 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Vault Funding Request
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                            ${Number(msg.fundingAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-slate-400">Depositing From: </span>
                            <span className="font-semibold text-white">{msg.fundingOrigin}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Reason for Deposit: </span>
                            <span className="font-semibold text-white">{msg.fundingReason}</span>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                          <span>Routed to {msg.agentName || currentAgent?.name}</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isInvoice || isAlert || isLetter) {
                  return (
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 px-1">
                        {msg.agentName || currentAgent?.name} · Official Fiduciary Dispatch
                      </div>
                      <div
                        className={`w-full max-w-[95%] rounded-2xl p-4 border shadow-md ${
                          isAlert
                            ? 'bg-red-50/90 border-red-300 text-slate-900'
                            : isInvoice
                            ? 'bg-amber-50/90 border-amber-300 text-slate-900'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                            {isInvoice ? (
                              <Receipt className="w-4 h-4 text-amber-700" />
                            ) : isAlert ? (
                              <ShieldAlert className="w-4 h-4 text-red-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-800" />
                            )}
                            <span
                              className={
                                isAlert
                                  ? 'text-red-700'
                                  : isInvoice
                                  ? 'text-amber-800'
                                  : 'text-slate-900'
                              }
                            >
                              {msg.letterCategory || (isInvoice ? 'Official Vault Invoice' : isAlert ? 'Account Alert' : 'Official Fiduciary Letter')}
                            </span>
                          </div>
                          {msg.letterReference && (
                            <span className="text-[11px] font-mono font-semibold text-slate-500">
                              {msg.letterReference}
                            </span>
                          )}
                        </div>

                        {msg.letterTitle && (
                          <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                            {msg.letterTitle}
                          </h4>
                        )}

                        {typeof msg.invoiceAmount === 'number' && msg.invoiceAmount > 0 && (
                          <div className="mb-2.5 p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                                Amount Due
                              </div>
                              <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                                ${msg.invoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            {msg.invoiceDueDate && (
                              <div className="text-right">
                                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                                  Due Date
                                </div>
                                <div className="text-xs font-semibold text-white">
                                  {msg.invoiceDueDate}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800">
                          {msg.text}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setMessage(
                                `Regarding ${msg.letterTitle || 'Official Notice'}${
                                  msg.letterReference ? ` (${msg.letterReference})` : ''
                                }: I have reviewed this and would like to proceed.`
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 cursor-pointer"
                          >
                            Acknowledge & Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                    {!isClient && (
                      <div className="text-[11px] font-semibold text-slate-500 mb-1 px-1">
                        {msg.agentName || currentAgent?.name || 'Advisor'} · {msg.agentRole || 'Fiduciary'}
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl ${
                        isClient
                          ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <div className="text-[10px] mt-1.5 font-medium text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message ${currentAgent?.name || 'Advisor'}...`}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow resize-none text-sm"
                    rows={Math.min(3, Math.max(1, message.split('\n').length))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
