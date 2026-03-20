import { useState, useRef, useEffect } from 'react';
import { getApiUrl } from '../services/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';

const PersonalCareChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your Personal Care Assistant. Ask me about cosmetic ingredients, skincare safety, or haircare products. For example:\n\n• Is SLS safe in shampoo?\n• What are parabens?\n• Which chemicals should sensitive skin avoid?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/chat-personal-care`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: userMessage.content })
      });

      const data = await response.json();

      let assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.answer,
        data: data
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Make sure the backend server is running on port 8000.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message) => {
    if (message.type === 'user') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mb-3"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] shadow-lg">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </motion.div>
      );
    }

    // Assistant message
    const msgData = message.data;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start mb-3"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white px-4 py-3 rounded-2xl rounded-bl-md max-w-[90%] shadow-xl">
          <div className="flex items-start gap-2">
            <span className="text-lg">🧴</span>
            <div className="flex-1">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Additional chemical info for single type */}
              {msgData && msgData.type === 'single' && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
                  <p className="text-xs">
                    <span className="text-purple-400 font-semibold">Category:</span> {msgData.category}
                  </p>
                  <p className="text-xs">
                    <span className="text-purple-400 font-semibold">Risk Level:</span>{' '}
                    <span className={`font-semibold ${
                      msgData.risk_level === 'High' ? 'text-red-400' : 
                      msgData.risk_level === 'Moderate' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {msgData.risk_level}
                    </span>
                  </p>
                  {msgData.effects && (
                    <p className="text-xs">
                      <span className="text-purple-400 font-semibold">Effects:</span> {msgData.effects}
                    </p>
                  )}
                  {msgData.avoid_for && (
                    <p className="text-xs">
                      <span className="text-purple-400 font-semibold">Avoid For:</span> {msgData.avoid_for}
                    </p>
                  )}
                </div>
              )}

              {/* List of chemicals */}
              {msgData && msgData.type === 'list' && msgData.chemicals && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  {msgData.chemicals.map((chem, idx) => (
                    <div key={idx} className="mb-2 pb-2 border-b border-slate-700/30 last:border-0">
                      <p className="text-xs font-semibold text-purple-400">
                        {chem.name}
                      </p>
                      <p className="text-xs text-slate-300">
                        Risk: <span className={`${
                          chem.risk_level === 'High' ? 'text-red-400' : 
                          chem.risk_level === 'Moderate' ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>{chem.risk_level}</span>
                      </p>
                      {chem.effects && (
                        <p className="text-xs text-slate-400">{chem.effects}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Floating AI Button - Premium Style */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] flex items-center justify-center text-2xl z-50"
        aria-label="Toggle chat"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(168,85,247,0.5)",
            "0 0 30px rgba(236,72,153,0.5)",
            "0 0 20px rgba(168,85,247,0.5)"
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {isOpen ? (
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >✕</motion.span>
        ) : (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >🧴</motion.span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-80 h-[500px] bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🧴</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Personal Care AI</h3>
                <p className="text-purple-200 text-xs">Skincare & Cosmetic Assistant</p>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
              {messages.map(message => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-3"
                >
                  <div className="bg-slate-800/80 text-white px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-slate-900/50 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about cosmetic ingredients..."
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PersonalCareChatbot;
