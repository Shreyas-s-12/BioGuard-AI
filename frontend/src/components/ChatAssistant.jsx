import { useState, useRef, useEffect } from 'react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm NutriDetect AI Assistant. Ask me about food additives, E-numbers, or chemicals in your food. For example:\n\n• What is E621?\n• Is Aspartame safe?\n• Which preservatives are high risk?"
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
      const response = await fetch('http://127.0.0.1:8000/chat', {
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
        <div className="flex justify-end mb-3">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%] shadow-lg">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      );
    }

    // Assistant message
    const msgData = message.data;
    
    return (
      <div className="flex justify-start mb-3">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 text-white px-4 py-3 rounded-2xl rounded-bl-md max-w-[90%] shadow-xl">
          <div className="flex items-start gap-2">
            <span className="text-lg">🤖</span>
            <div className="flex-1">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Additional chemical info for single type */}
              {msgData && msgData.type === 'single' && (
                <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
                  <p className="text-xs">
                    <span className="text-emerald-400 font-semibold">Category:</span> {msgData.category}
                  </p>
                  <p className="text-xs">
                    <span className="text-emerald-400 font-semibold">Risk Level:</span>{' '}
                    <span className={`font-semibold ${
                      msgData.risk_level === 'High' ? 'text-red-400' : 
                      msgData.risk_level === 'Moderate' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {msgData.risk_level}
                    </span>
                  </p>
                  {msgData.health_concerns && (
                    <p className="text-xs">
                      <span className="text-emerald-400 font-semibold">Health Concerns:</span> {msgData.health_concerns}
                    </p>
                  )}
                  {msgData.purpose && (
                    <p className="text-xs">
                      <span className="text-emerald-400 font-semibold">Purpose:</span> {msgData.purpose}
                    </p>
                  )}
                </div>
              )}

              {/* List of chemicals */}
              {msgData && msgData.type === 'list' && msgData.chemicals && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  {msgData.chemicals.map((chem, idx) => (
                    <div key={idx} className="mb-2 pb-2 border-b border-white/10 last:border-0">
                      <p className="text-xs font-semibold text-emerald-400">
                        {chem.e_number} - {chem.chemical_name}
                      </p>
                      <p className="text-xs text-gray-300">
                        Risk: <span className={`${
                          chem.risk_level === 'High' ? 'text-red-400' : 
                          chem.risk_level === 'Moderate' ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>{chem.risk_level}</span>
                      </p>
                      {chem.health_concerns && (
                        <p className="text-xs text-gray-400">{chem.health_concerns}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_20px_rgba(56,189,248,0.8)] hover:scale-110 transition flex items-center justify-center text-2xl z-50"
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">NutriDetect AI</h3>
              <p className="text-emerald-200 text-xs">Food Safety Assistant</p>
            </div>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
            {messages.map(message => (
              <div key={message.id}>
                {renderMessage(message)}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white/10 text-white px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white/5 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about food additives..."
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
