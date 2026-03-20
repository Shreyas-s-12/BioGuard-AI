import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { analyzePersonalCare } from '../../services/api';
import CameraOCR from '../../components/CameraOCR';

const MAX_INPUT_CHARS = 5000;

const PRODUCT_TYPES = [
  { value: 'skincare', label: 'Skincare', icon: '🧴' },
  { value: 'haircare', label: 'Hair Care', icon: '💇' },
  { value: 'makeup', label: 'Makeup', icon: '💄' },
  { value: 'bodycare', label: 'Body Care', icon: '🧼' },
  { value: 'sunscreen', label: 'Sunscreen', icon: '☀️' },
  { value: 'soap', label: 'Soap', icon: '🧼' },
  { value: 'toothpaste', label: 'Toothpaste', icon: '🦷' },
  { value: 'deodorant', label: 'Deodorant', icon: '👃' },
];

const SKIN_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' },
];

const HAIR_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'colored', label: 'Colored' },
  { value: 'curly', label: 'Curly' },
  { value: 'straight', label: 'Straight' },
  { value: 'fine', label: 'Fine' },
  { value: 'thick', label: 'Thick' },
];

export default function PersonalCareAnalyze() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [productType, setProductType] = useState('');
  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showCameraOCR, setShowCameraOCR] = useState(false);
  const textareaRef = useRef(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      alert('Please enter ingredients to analyze');
      return;
    }

    if (!productType) {
      alert('Please select a product type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzePersonalCare(
        inputText,
        productType,
        skinType,
        hairType
      );
      setResults(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Voice recognition handler
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        recognition.start();
      })
      .catch(() => {
        alert("Microphone access required. Please allow microphone permission and try again.");
      });
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => prev + (prev ? '\n' : '') + transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (event.error === 'network') {
        alert("Voice recognition network error. Please check your internet connection and try again.");
      } else if (event.error === 'no-speech') {
        // No speech detected - silently ignore
        console.log('No speech detected');
      } else {
        alert(`Voice recognition error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      console.log('Voice recognition stopped');
    };
  };

  const handleOCRResult = (extractedText) => {
    setInputText(prev => prev ? `${prev}\n${extractedText}` : extractedText);
    setShowCameraOCR(false);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'moderate': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-400';
    }
  };

  const getRiskBg = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 border-red-500/50';
      case 'moderate': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 border-green-500/50';
      default: return 'bg-slate-500/20 border-slate-500/50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Analyze Personal Care
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Paste product ingredients to detect harmful chemicals and skin compatibility
          </p>
        </div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 mb-6 ${
            isDark 
              ? 'bg-slate-900/60 border border-slate-800' 
              : 'bg-white border border-slate-200'
          } backdrop-blur-xl shadow-xl`}
        >
          {/* Product Type Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-slate-700'
            }`}>
              Product Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setProductType(type.value)}
                  className={`p-3 rounded-xl border transition-all ${
                    productType === type.value
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : isDark
                        ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl block mb-1">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personalization Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Skin Type */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-slate-700'
              }`}>
                Your Skin Type (optional)
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className={`w-full p-3 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-800/50 border-slate-700 text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                } focus:outline-none focus:border-purple-500/50`}
              >
                <option value="">Select skin type</option>
                {SKIN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Hair Type */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-slate-700'
              }`}>
                Your Hair Type (optional)
              </label>
              <select
                value={hairType}
                onChange={(e) => setHairType(e.target.value)}
                className={`w-full p-3 rounded-xl border ${
                  isDark 
                    ? 'bg-slate-800/50 border-slate-700 text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                } focus:outline-none focus:border-purple-500/50`}
              >
                <option value="">Select hair type</option>
                {HAIR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ingredients Input */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className={`text-sm font-semibold ${
                isDark ? 'text-white' : 'text-slate-700'
              }`}>
                Ingredients *
              </label>
              <div className="flex items-center gap-3">
                {/* Voice Input Button */}
                <button
                  onClick={startVoiceRecognition}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  title="Click to use voice input"
                >
                  🎤 Voice Input
                </button>
                {/* Scan Label Button */}
                <button
                  onClick={() => setShowCameraOCR(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  📷 Scan Label
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT_CHARS))}
              placeholder="Enter ingredients list (e.g., Water, Glycerin, SLS, Parabens, Fragrance...)"
              className={`w-full h-40 p-4 rounded-xl border resize-none ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 placeholder-slate-400'
              } focus:outline-none focus:border-purple-500/50`}
            />
            <div className="text-right text-xs mt-1 text-slate-500">
              {inputText.length}/{MAX_INPUT_CHARS}
            </div>
          </div>

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg ${
              loading
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
            } text-white shadow-lg`}
          >
            {loading ? 'Analyzing...' : 'Analyze Ingredients'}
          </motion.button>

          {error && (
            <p className="text-red-400 text-center mt-4">{error}</p>
          )}
        </motion.div>

        {/* Camera OCR Modal */}
        <AnimatePresence>
          {showCameraOCR && (
            <CameraOCR
              onClose={() => setShowCameraOCR(false)}
              onResult={handleOCRResult}
            />
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Risk Level */}
              <div className={`rounded-2xl p-6 border ${getRiskBg(results.risk_level)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}>
                      Overall Risk Level
                    </h3>
                    <p className={`text-4xl font-bold ${getRiskColor(results.risk_level)}`}>
                      {results.risk_level || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-6xl">
                    {results.risk_level === 'High' ? '⚠️' : results.risk_level === 'Moderate' ? '⚡' : '✅'}
                  </div>
                </div>
              </div>

              {/* Suitability */}
              {results.suitability && (
                <div className={`rounded-2xl p-6 ${
                  isDark 
                    ? 'bg-slate-900/60 border border-slate-800' 
                    : 'bg-white border border-slate-200'
                } backdrop-blur-xl`}>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Compatibility
                  </h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                    results.suitability.includes('Not suitable')
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    <span className="text-xl">
                      {results.suitability.includes('Not suitable') ? '⚠️' : '✅'}
                    </span>
                    <span className="font-medium">{results.suitability}</span>
                  </div>
                </div>
              )}

              {/* Detected Chemicals */}
              {results.detected_chemicals && results.detected_chemicals.length > 0 && (
                <div className={`rounded-2xl p-6 ${
                  isDark 
                    ? 'bg-slate-900/60 border border-slate-800' 
                    : 'bg-white border border-slate-200'
                } backdrop-blur-xl`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Detected Chemicals ({results.detected_chemicals.length})
                  </h3>
                  <div className="space-y-3">
                    {results.detected_chemicals.map((chemical, idx) => (
                      <div key={idx} className={`p-4 rounded-xl ${
                        isDark ? 'bg-slate-800/50' : 'bg-slate-100'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-semibold ${
                            isDark ? 'text-white' : 'text-slate-800'
                          }`}>
                            {chemical.name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            chemical.risk === 'High' 
                              ? 'bg-red-500/20 text-red-400'
                              : chemical.risk === 'Moderate'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                          }`}>
                            {chemical.risk}
                          </span>
                        </div>
                        {chemical.effects && (
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {chemical.effects}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Effects */}
              {results.effects && results.effects.length > 0 && (
                <div className={`rounded-2xl p-6 ${
                  isDark 
                    ? 'bg-slate-900/60 border border-slate-800' 
                    : 'bg-white border border-slate-200'
                } backdrop-blur-xl`}>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Potential Effects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.effects.map((effect, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm ${
                        isDark 
                          ? 'bg-slate-800 text-slate-300' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className={`rounded-2xl p-6 ${
                  isDark 
                    ? 'bg-slate-900/60 border border-slate-800' 
                    : 'bg-white border border-slate-200'
                } backdrop-blur-xl`}>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <span className="text-purple-400">💡</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No chemicals found */}
              {(!results.detected_chemicals || results.detected_chemicals.length === 0) && (
                <div className={`rounded-2xl p-6 ${
                  isDark 
                    ? 'bg-green-900/20 border border-green-500/30' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">✅</span>
                    <div>
                      <h3 className={`font-semibold ${
                        isDark ? 'text-green-400' : 'text-green-700'
                      }`}>
                        No Harmful Chemicals Detected
                      </h3>
                      <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        This product appears to be safe based on our database.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
