import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePersonalCare } from '../../services/api';
import BarcodeScanner from '../../components/BarcodeScanner';
import CameraOCR from '../../components/CameraOCR';
import { savePersonalCareRisk } from '../../components/ExposureScore';

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
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [productType, setProductType] = useState('');
  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCameraOCR, setShowCameraOCR] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef(null);
  const lastAnalyzeAtRef = useRef(0);

  const handleAnalyze = async () => {
    const now = Date.now();
    if (now - lastAnalyzeAtRef.current < 500) {
      return;
    }
    lastAnalyzeAtRef.current = now;

    if (!inputText.trim()) {
      setError('Please enter ingredients to analyze');
      return;
    }

    if (!productType) {
      setError('Please select a product type');
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

      if (data && data.detected_chemicals) {
        const riskLevel = String(data.risk_level || '').toLowerCase().trim();
        
        data.detected_chemicals.forEach((chemical) => {
          const chemRiskLevel = String(chemical.risk_level || '').toLowerCase().trim();
          let score = 1;
          if (chemRiskLevel === 'moderate') score = 2;
          else if (chemRiskLevel === 'high') score = 3;
          
          savePersonalCareRisk({
            name: chemical.chemical_name || chemical.name || 'Unknown',
            riskLevel: chemRiskLevel,
            score: score,
            productName: productType || 'Personal Care Product'
          });
        });
      }

      setResults(data);
      
      const historyItem = {
        ...data,
        productType,
        date: new Date().toISOString()
      };
      const existingHistoryRaw = localStorage.getItem('personalCareHistory');
      let existingHistory = [];
      try {
        const parsed = JSON.parse(existingHistoryRaw || '[]');
        existingHistory = Array.isArray(parsed) ? parsed : [];
      } catch (_parseErr) {
        existingHistory = [];
      }
      existingHistory.push(historyItem);
      localStorage.setItem('personalCareHistory', JSON.stringify(existingHistory));
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to analyze. Please try again with valid ingredients.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => recognition.start())
      .catch(() => alert("Microphone access required."));
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => prev + (prev ? '\n' : '') + transcript);
    };
    
    recognition.onerror = (event) => console.error('Voice recognition error:', event.error);
    recognition.onend = () => console.log('Voice recognition stopped');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setInputText((prev) => prev + (prev ? '\n\n' : '') + text);
    }
  };

  const loadExample = () => {
    setInputText('Water, Glycerin, Sodium Lauryl Sulfate, Cocamidopropyl Betaine, Parabens, Fragrance, Sodium Chloride, Citric Acid, Aloe Barbadensis Leaf Juice');
  };

  const handleScanComplete = (ingredients) => {
    setInputText(ingredients);
    setShowBarcodeScanner(false);
    setShowCameraOCR(false);
    if (ingredients && ingredients.trim() && productType) {
      setTimeout(() => handleAnalyze(), 100);
    }
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
    <div className="max-w-4xl mx-auto p-4">
      {/* Standardized Page Header */}
      <div className="page-header">
        <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
          AI-Powered Analysis
        </div>
        <h1 className="page-title text-4xl">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            Analyze Personal Care
          </span>
        </h1>
        <p className="page-subtitle">
          Paste product ingredients to detect harmful chemicals and skin compatibility
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Product Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-3">
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
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-xl block mb-1">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin and Hair Type */}
      <div className="mb-6 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Your Skin Type (optional)</label>
          <select
            value={skinType}
            onChange={(e) => setSkinType(e.target.value)}
            className="w-full p-3 rounded-xl border bg-slate-800/50 border-slate-700 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select skin type</option>
            {SKIN_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Your Hair Type (optional)</label>
          <select
            value={hairType}
            onChange={(e) => setHairType(e.target.value)}
            className="w-full p-3 rounded-xl border bg-slate-800/50 border-slate-700 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Select hair type</option>
            {HAIR_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={startVoiceRecognition}
          className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Voice Input
        </button>

        <button
          onClick={() => setShowBarcodeScanner(true)}
          className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan Barcode
        </button>

        <button
          onClick={() => setShowCameraOCR(true)}
          className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          Scan Label
        </button>
      </div>

      {/* Text Area */}
      <div 
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 mb-4 ${
          isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT_CHARS))}
          placeholder="Paste Ingredients here..."
          className="w-full h-48 bg-transparent border-0 p-4 text-white placeholder-slate-500 focus:outline-none resize-none font-mono text-sm"
        />
        
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 rounded-2xl">
            <p className="text-purple-400 font-medium">Drop to add text</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-slate-500">Supports drag & drop</span>
        <button onClick={loadExample} className="text-purple-400 hover:text-purple-300 text-sm">
          Load Example
        </button>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !inputText.trim()}
        className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all ${
          loading || !inputText.trim()
            ? 'bg-slate-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-90'
        }`}
      >
        {loading ? 'Analyzing...' : 'Analyze Personal Care'}
      </button>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <div className={`rounded-2xl p-6 border ${getRiskBg(results.risk_level)}`}>
              <h3 className="text-lg font-semibold text-white mb-2">Overall Risk Level</h3>
              <p className={`text-4xl font-bold ${getRiskColor(results.risk_level)}`}>
                {results.risk_level || 'Unknown'}
              </p>
            </div>

            {results.detected_chemicals && results.detected_chemicals.length > 0 && (
              <div className="rounded-2xl p-6 bg-slate-800/50 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Detected Chemicals ({results.detected_chemicals.length})
                </h3>
                <div className="space-y-3">
                  {results.detected_chemicals.map((chemical, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/50">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{chemical.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          chemical.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                          chemical.risk === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {chemical.risk}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Camera OCR Modal */}
      {showCameraOCR && (
        <CameraOCR
          onScanComplete={handleOCRResult}
          onClose={() => setShowCameraOCR(false)}
        />
      )}
    </div>
  );
}
