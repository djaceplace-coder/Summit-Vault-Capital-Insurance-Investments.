import { Search, Send, CheckCircle2, ShieldCheck, Receipt, ShieldAlert, FileText, ArrowDownLeft } from 'lucide-react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot, query, orderBy, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useAgents } from '../../lib/agentsData';
import { LiveMessage } from '../../components/dashboard/AgentChatDrawer';

export function Messages() {
  const { user, profile } = useAuth();
  const { agents } = useAgents();
  const [searchParams] = useSearchParams();
  const activeAgents = agents.filter((a) => a.status === 'Active');

  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => {
    return searchParams.get('agent') || profile?.assignedAgentId || 'AG-001';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAgent =
    activeAgents.find((a) => a.id === selectedAgentId) || activeAgents[0] || agents[0];

  useEffect(() => {
    const paramAgent = searchParams.get('agent');
    if (paramAgent) {
      setSelectedAgentId(paramAgent);
    }
  }, [searchParams]);

  // Real-time listener on client's chat thread
  useEffect(() => {
    if (!user) return;

    const sessionRef = doc(db, 'chats', user.uid);
    const unsubSession = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.selectedAgentId && !searchParams.get('agent')) {
          setSelectedAgentId(data.selectedAgentId);
        }
        if ((data?.unreadByClient || 0) > 0) {
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
  }, [user]);

  const handleSelectAgent = async (agentId: string) => {
    setSelectedAgentId(agentId);
    if (!user) return;
    const chosen = agents.find((a) => a.id === agentId);
    if (!chosen) return;
    try {
      await setDoc(
        doc(db, 'chats', user.uid),
        {
          userId: user.uid,
          userEmail: profile?.email || user.email || '',
          userName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user.email || 'Client',
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

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || sending) return;
    const textToSend = message.trim();
    setMessage('');
    setSending(true);

    try {
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const clientName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user.email || 'Client';

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

  const filteredAgents = activeAgents.filter(
    (ag) =>
      ag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="w-full h-[calc(100vh-150px)] min-h-[600px] flex flex-col sm:flex-row bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Left Sidebar: Choose Agent to Speak With */}
        <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-slate-100 flex flex-col bg-slate-50 max-h-60 sm:max-h-none">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h2 className="text-lg font-bold font-heading text-slate-900 mb-1">Choose Advisor to Chat</h2>
            <p className="text-xs text-slate-500 mb-3">
              Select any accredited specialist below to direct your conversation.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search specialists..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredAgents.map((ag) => {
              const isSelected = currentAgent?.id === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => handleSelectAgent(ag.id)}
                  className={`w-full text-left p-3.5 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer ${
                    isSelected ? 'bg-white shadow-[inset_4px_0_0_0_#d97706]' : ''
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300">
                    <img src={ag.img} alt={ag.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <div className="font-semibold text-sm text-slate-900 truncate">{ag.name}</div>
                      {profile?.assignedAgentId === ag.id && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Assigned
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{ag.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Way Live Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 bg-slate-800">
                {currentAgent?.img && (
                  <img src={currentAgent.img} alt={currentAgent.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">{currentAgent?.name || 'Sarah Jenkins'}</h3>
                <div className="text-xs text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentAgent?.role} · Live 2-Way Channel</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>End-to-End Vault Desk</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="flex gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 mt-1">
                  {currentAgent?.img && (
                    <img src={currentAgent.img} alt={currentAgent.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-xs text-slate-700 text-sm leading-relaxed shadow-2xs">
                  <div className="text-xs font-bold text-amber-700 mb-1">
                    {currentAgent?.name} · {currentAgent?.role}
                  </div>
                  Hello {profile?.firstName || 'Investor'}, you are connected to our live advisory desk. Send a message below and our team will respond directly in this thread.
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isClient = msg.senderRole === 'client';
                const isFundingReq = msg.messageType === 'funding_request';
                const isInvoice = msg.messageType === 'invoice';
                const isAlert = msg.messageType === 'account_alert';
                const isLetter = msg.messageType === 'letter';

                if (isFundingReq) {
                  return (
                    <div key={msg.id} className="flex flex-col items-end">
                      <div className="w-full max-w-lg rounded-2xl bg-slate-900 text-white p-4 border border-amber-500/40 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <ArrowDownLeft className="w-4 h-4" /> Vault Funding Request
                          </span>
                          <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                            ${Number(msg.fundingAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs sm:text-sm">
                          <div>
                            <span className="text-slate-400">Depositing From: </span>
                            <span className="font-semibold text-white">{msg.fundingOrigin}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Reason for Deposit: </span>
                            <span className="font-semibold text-white">{msg.fundingReason}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isInvoice || isAlert || isLetter) {
                  return (
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="text-[11px] font-semibold text-amber-700 mb-1 px-1">
                        {msg.agentName || currentAgent?.name} · Official Vault Letterhead
                      </div>
                      <div
                        className={`w-full max-w-xl rounded-2xl p-5 border shadow-md ${
                          isAlert
                            ? 'bg-red-50/90 border-red-300 text-slate-900'
                            : isInvoice
                            ? 'bg-amber-50/90 border-amber-300 text-slate-900'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                            {isInvoice ? (
                              <Receipt className="w-4 h-4 text-amber-700" />
                            ) : isAlert ? (
                              <ShieldAlert className="w-4 h-4 text-red-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-800" />
                            )}
                            <span>
                              {msg.letterCategory || (isInvoice ? 'Official Vault Invoice' : isAlert ? 'Account Alert' : 'Official Letter')}
                            </span>
                          </div>
                          {msg.letterReference && (
                            <span className="text-xs font-mono font-semibold text-slate-500">
                              {msg.letterReference}
                            </span>
                          )}
                        </div>

                        {msg.letterTitle && (
                          <h4 className="font-bold text-slate-900 text-base mb-2">{msg.letterTitle}</h4>
                        )}

                        {typeof msg.invoiceAmount === 'number' && msg.invoiceAmount > 0 && (
                          <div className="mb-3 p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-400">Amount Due</div>
                              <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                                ${msg.invoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            {msg.invoiceDueDate && (
                              <div className="text-right">
                                <div className="text-[10px] uppercase tracking-wider text-slate-400">Due Date</div>
                                <div className="text-xs font-semibold text-white">{msg.invoiceDueDate}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-800">{msg.text}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[11px] text-slate-400 mb-1 px-1">
                      {isClient ? (
                        <span>You (to {msg.agentName || currentAgent?.name})</span>
                      ) : (
                        <span className="font-semibold text-amber-700">
                          {msg.agentName || currentAgent?.name} · {msg.agentRole || 'Fiduciary Advisor'}
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        isClient
                          ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isClient && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 transition-all">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write a message to ${currentAgent?.name || 'your advisor'}...`}
                  className="w-full bg-transparent p-3.5 max-h-32 min-h-[46px] outline-none resize-none text-sm"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
