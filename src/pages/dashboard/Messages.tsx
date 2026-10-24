import { motion } from 'motion/react';
import { Search, Send, User, MoreVertical, Paperclip, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const threads = [
  { id: '1', agent: 'Sarah Jenkins', role: 'Wealth Advisor', lastMessage: 'Your Q3 portfolio review is ready to view.', time: '10:42 AM', unread: true },
  { id: '2', agent: 'Marcus Webb', role: 'Insurance Specialist', lastMessage: 'The life insurance policy documents have been processed.', time: 'Yesterday', unread: false },
  { id: '3', agent: 'Support Team', role: 'General Support', lastMessage: 'We have resolved the issue with your external bank link.', time: 'Jul 20', unread: false },
];

export function Messages() {
  const [activeThread, setActiveThread] = useState(threads[0].id);
  const [message, setMessage] = useState('');
  
  const currentThread = threads.find(t => t.id === activeThread);

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[600px] flex flex-col sm:flex-row bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-full sm:w-1/3 md:w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-100 transition-colors flex gap-3 ${
                activeThread === thread.id ? 'bg-white shadow-[inset_4px_0_0_0_#0f172a]' : ''
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                {thread.unread && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className={`font-semibold truncate ${thread.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                    {thread.agent}
                  </div>
                  <div className={`text-xs ${thread.unread ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                    {thread.time}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-1">{thread.role}</div>
                <div className={`text-sm truncate ${thread.unread ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                  {thread.lastMessage}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {currentThread ? (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{currentThread.agent}</h3>
                  <div className="text-sm text-slate-500">{currentThread.role}</div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-center">
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                  Today
                </span>
              </div>
              
              <div className="flex gap-4 max-w-2xl">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-sm text-slate-700 text-sm leading-relaxed">
                    Hello! I've reviewed your current portfolio allocation based on the changing market conditions. I recommend a slight rebalance to increase your fixed income exposure. Your Q3 review document is attached.
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors max-w-xs">
                      <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-medium text-slate-900 truncate">Q3_Portfolio_Review.pdf</div>
                        <div className="text-xs text-slate-500">2.4 MB</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 ml-1">10:42 AM</div>
                </div>
              </div>
              
              <div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
                <div>
                  <div className="bg-slate-900 text-white p-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                    Thanks Sarah. I'll take a look at the document this evening. Can we schedule a quick call tomorrow to discuss the fixed income options?
                  </div>
                  <div className="text-xs text-slate-400 mt-1 mr-1 flex items-center justify-end gap-1">
                    11:15 AM <CheckCircle2 className="w-3 h-3 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white">
              <form 
                onSubmit={(e) => { e.preventDefault(); if (message) setMessage(''); }}
                className="flex items-end gap-2"
              >
                <button type="button" className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-transparent p-3 max-h-32 min-h-[44px] outline-none resize-none text-sm"
                    rows={1}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!message.trim()}
                  className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
