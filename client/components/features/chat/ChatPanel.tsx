'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ChatPanel() {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ah ah! My guy, wetin you need help with? I dey here for you o!'
    }
  ]);

  const handleClose = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('chat');
    router.push(`/?${params.toString()}`);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([...messages, { role: 'user', content: message }]);
    setMessage('');

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'AI responses will be implemented when DeepSeek service is ready.'
      }]);
    }, 500);
  };

  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full shadow-float flex items-center justify-center text-white text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        💬
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-0 right-0 md:right-8 md:bottom-8 w-full md:w-96 h-[50vh] md:h-[600px] glass-heavy rounded-t-2xl md:rounded-2xl shadow-float z-50 flex flex-col"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👨🏾‍💼</span>
          <div>
            <div className="font-semibold">Uncle Japa</div>
            <div className="text-xs text-text-tertiary">Online</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {['How much should I save?', 'What documents do I need?'].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setMessage(suggestion)}
            className="px-3 py-1 text-sm bg-bg-secondary dark:bg-dark-bg-secondary rounded-full whitespace-nowrap hover:bg-accent-primary hover:text-white transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type message..."
            className="flex-1 px-4 py-2 rounded-full bg-bg-secondary dark:bg-dark-bg-secondary border border-bg-tertiary dark:border-dark-bg-tertiary focus:border-accent-primary outline-none"
          />
          <button className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-full transition-colors">
            😊
          </button>
          <button className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-full transition-colors">
            📎
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-accent-primary text-white rounded-full font-medium hover:bg-accent-secondary transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
