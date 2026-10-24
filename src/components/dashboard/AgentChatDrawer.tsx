import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Paperclip, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function AgentChatDrawer({ 
  isOpen, 
  onClose, 
  prefilledMessage = ''
}: { 
  isOpen: boolean; 
  onClose: () => void;
  prefilledMessage?: string;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am your dedicated advisor, Sarah. How can I help you today?', sender: 'agent', time: '10:00 AM' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefilledMessage && isOpen) {
      setMessage(prefilledMessage);
    }
  }, [prefilledMessage, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'client', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setMessage('');
    
    // Simulate agent typing
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: 'I received your request and am looking into it right now. Give me a moment to process this for you.', 
        sender: 'agent', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    }, 1500);
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-100 shadow-2xl z-[80] flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">Sarah Jenkins</h3>
                  <div className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              <div className="text-center text-xs text-slate-400 mb-6 font-medium uppercase tracking-wider">
                Secure Chat Established
              </div>
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl ${msg.sender === 'client' ? 'bg-slate-900 text-white rounded-tr-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-[10px] mt-1.5 font-medium ${msg.sender === 'client' ? 'text-slate-400' : 'text-slate-400'}`}>{msg.time}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2 mb-3">
                 <button className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                   <Calendar className="w-3.5 h-3.5" /> Book a Call
                 </button>
              </div>
              <div className="flex items-end gap-2">
                <button className="p-3 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message securely..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow resize-none"
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
                  disabled={!message.trim()}
                  className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
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
