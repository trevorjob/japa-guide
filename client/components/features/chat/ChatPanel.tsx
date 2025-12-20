'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { aiService } from '@/lib/services';
import type { ChatMessage, ChatRequest } from '@/types';

const STORAGE_KEY = 'japa_guide_chat_history';

export default function ChatPanel({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const countryCode = searchParams.get('country');

  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [selectedTone, setSelectedTone] = useState<string>('uncle_japa');

  // Load chat history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(parsed.messages || []);
        setConversationId(parsed.conversationId);
        setSelectedTone(parsed.tone || 'uncle_japa');
      } catch (err) {
        console.error('Failed to parse chat history:', err);
      }
    } else {
      // Welcome message
      const welcomeMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getWelcomeMessage(selectedTone),
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages,
          conversationId,
          tone: selectedTone,
          lastUpdated: new Date().toISOString(),
        })
      );
    }
  }, [messages, conversationId, selectedTone]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear chat when country changes
  useEffect(() => {
    if (countryCode) {
      const lastCountry = localStorage.getItem('last_chat_country');
      if (lastCountry && lastCountry !== countryCode && messages.length > 1) {
        handleClearChat();
      }
      localStorage.setItem('last_chat_country', countryCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  const getWelcomeMessage = (tone: string) => {
    const welcomes: Record<string, string> = {
      uncle_japa: 'Ah ah! My guy, wetin you wan know about japa? I don get experience, I fit help you o!',
      helpful: 'Hello! I&apos;m here to help you with your migration journey. What would you like to know?',
      bestie: 'Heyyyy bestie! 💅 Ready to spill the tea on your dream country? Let&apos;s goooo!',
      strict_officer: 'Good day. State your inquiry regarding immigration procedures.',
      hype_man: 'YO YO YO! 🔥 Let&apos;s GET IT! What country we conquering today?!',
      therapist: 'Welcome. Take a deep breath. Moving abroad can feel overwhelming, but you&apos;re not alone. How can I support you today?',
    };
    return welcomes[tone] || welcomes.helpful;
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleClearChat = () => {
    const welcomeMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: getWelcomeMessage(selectedTone),
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
    setConversationId(undefined);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Tone switched to ${tone}! ${getWelcomeMessage(tone)}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      // Build conversation history from recent messages (excluding welcome message)
      const conversationHistory = messages
        .filter(msg => msg.role === 'user' || (msg.role === 'assistant' && !msg.content.includes('wetin you wan know') && !msg.content.includes('Tone switched')))
        .slice(-6) // Last 6 messages for context
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Add the current message to history
      conversationHistory.push({
        role: 'user',
        content: userMsg.content,
      });

      const request: ChatRequest = {
        message: userMsg.content,
        tone: selectedTone,
        context: countryCode ? { country: countryCode } : undefined,
        conversation_id: conversationId,
        country_code: countryCode || undefined,
        conversation_history: conversationHistory,
      };

      console.log('Sending chat request:', request);
      const response = await aiService.chat(request);
      console.log('Received chat response:', response);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        conversationId: response.conversation_id,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setConversationId(response.conversation_id);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const personalities = [
    { id: 'uncle_japa', emoji: '👨🏾‍💼', name: 'Uncle Japa' },
    { id: 'helpful', emoji: '🤝', name: 'Helpful' },
    { id: 'bestie', emoji: '💅🏽', name: 'Bestie' },
    { id: 'strict_officer', emoji: '👮', name: 'Officer' },
    { id: 'hype_man', emoji: '🔥', name: 'Hype Man' },
    { id: 'therapist', emoji: '🧘', name: 'Therapist' },
  ];

  const quickSuggestions = countryCode
    ? [
      `Tell me about ${countryCode}`,
      'What documents do I need?',
      'How much should I save?',
      'Timeline to move?',
    ]
    : [
      'Which country is easiest?',
      'Compare Canada vs Australia',
      'Budget-friendly options?',
      'Best for tech workers?',
    ];

  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 glass-light glass-shine shadow-float flex items-center justify-center text-white text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <img width="32" height="32" src="https://img.icons8.com/liquid-glass-color/32/sms.png" alt="sms" />
      </motion.button>
    );
  }

  const currentPersonality = personalities.find((p) => p.id === selectedTone) || personalities[0];

  return (
    <motion.div
      className="fixed bottom-0 right-0 md:right-8 md:bottom-8 z-50"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="w-full md:w-96 h-[70vh] md:max-h-[calc(100vh-56px)] md:h-auto glass-heavy glass-shine rounded-t-2xl md:rounded-2xl shadow-float flex flex-col">
        {/* Header */}
        <div className="shrink-1 p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentPersonality.emoji}</span>
              <div>
                <div className="font-semibold text-text-primary">{currentPersonality.name}</div>
                <div className="text-xs text-text-tertiary">
                  {loading ? 'Typing...' : 'Online'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {/* <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button> */}
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

          {/* Context Badge */}
          {countryCode && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full">
                📍 Discussing: {countryCode}
              </span>
            </div>
          )}

          {/* Personality Selector */}
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => handleToneChange(p.id)}
                className={`px-2 py-1 rounded-lg text-xs transition-colors shrink-0 ${selectedTone === p.id
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary dark:bg-dark-bg-tertiary text-text-secondary hover:bg-accent-primary/20'
                  }`}
                title={p.name}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary'
                    }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-inherit">
                      <ReactMarkdown
                        components={{
                          // Custom styling for markdown elements
                          h1: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1">{children}</h3>,
                          h2: ({ children }) => <h4 className="text-sm font-bold mt-2 mb-1">{children}</h4>,
                          h3: ({ children }) => <h5 className="text-sm font-semibold mt-2 mb-1">{children}</h5>,
                          p: ({ children }) => <p className="my-1 text-sm leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-primary underline hover:text-accent-secondary">
                              {children}
                            </a>
                          ),
                          hr: () => <hr className="my-2 border-glass-border" />,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-accent-primary pl-2 my-2 italic text-text-secondary">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap wrap-break-word text-sm">{msg.content}</div>
                  )}
                  <div
                    className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-text-tertiary'
                      }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-bg-secondary dark:bg-dark-bg-secondary p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 2 && (
          <div className="shrink-0 px-4 py-2">
            <div className="text-xs text-text-tertiary mb-2">Quick questions:</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="px-3 py-1.5 text-xs bg-bg-secondary dark:bg-dark-bg-secondary rounded-full whitespace-nowrap hover:bg-accent-primary hover:text-white transition-colors shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 p-4 border-t border-glass-border">
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 px-4 py-2 rounded-2xl bg-bg-secondary dark:bg-dark-bg-secondary border border-bg-tertiary dark:border-dark-bg-tertiary focus:border-accent-primary outline-none resize-none max-h-24 text-text-primary"
              style={{ minHeight: '40px' }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || loading}
              className="px-4 py-2 bg-accent-primary text-white rounded-full font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
