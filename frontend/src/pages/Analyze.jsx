import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { analyzeFoodWithHealthMode } from '../services/api';
import BarcodeScanner from '../components/BarcodeScanner';
import CameraOCR from '../components/CameraOCR';

function Analyze() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('auto');
  const [healthCondition, setHealthCondition] = useState('');
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCameraOCR, setShowCameraOCR] = useState(false);

  // Voice recognition handler
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Set language based on selection
    const langMap = {
      'auto': 'en-US',
      'en': 'en-US',
      'es': 'es-ES',
      'hi': 'hi-IN',
      'kn': 'kn-IN'
    };
    recognition.lang = langMap[language] || 'en-US';
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

  const parseInput = (text) => {
    // First, clean the input - remove nutrition facts and numbers
    let cleanedText = text
      // Remove "Nutrition Facts" and everything after it until we hit "Ingredients"
      .replace(/nutrition facts.*?(?=ingredients)/gi, '')
      // Also remove standalone nutrition facts section
      .replace(/^\s*nutrition facts\s*$/gmi, '')
      // Remove calorie-related lines
      .replace(/calories\s*\d+/gi, '')
      // Remove lines that are just numbers with units (like "0g", "40mg", etc.)
      .replace(/\b\d+\s*(g|mg|mcg|kg|ml|l|cal|kcal)%?\b/gi, '')
      // Remove standalone numbers
      .replace(/^\d+\s*$/gm, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into ingredients and nutrition facts sections
    const ingredientsMatch = cleanedText.toLowerCase().includes('ingredient');
    let ingredients = '';
    let nutritionText = '';
    
    if (ingredientsMatch) {
      // Try to extract ingredients
      const ingredientLines = cleanedText.split(/\n|ingredients/i).slice(1);
      if (ingredientLines.length > 0) {
        const splitPattern = new RegExp('(nutrition|facts|calories|serving|amount)', 'i');
        ingredients = ingredientLines.join(' ').split(splitPattern);
        ingredients = ingredients[0] || '';
      }
    }
    
    // If no separate sections, assume the whole text might be ingredients
    if (!ingredients.trim()) {
      ingredients = cleanedText;
    }
    
    return { ingredients: ingredients.trim(), nutritionText: nutritionText.trim() };
  };

  const handleAnalyze = async () => {
    // Validate input - check minimum length
    if (!inputText || inputText.trim().length < 5) {
      setError('Please enter valid ingredients (at least 5 characters).');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Sending food analysis request");
      
      // Parse input to extract ingredients and nutrition text
      const { ingredients, nutritionText } = parseInput(inputText);
      
      // Validate that we have actual ingredients after cleaning
      if (!ingredients || ingredients.trim().length < 3) {
        throw new Error('Could not extract valid ingredients from input. Please paste ingredients list.');
      }
      
      // Use the new analyzeFoodWithHealthMode function with all advanced features
      const result = await analyzeFoodWithHealthMode(
        ingredients, 
        nutritionText, 
        language,
        healthCondition || null
      );

      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid analysis response received from server.');
      }
      
      // Ensure required fields exist with fallbacks
      const safeResult = {
        risk_score: result.risk_score ?? 0,
        risk_level: result.risk_level ?? 'Low',
        detected_chemicals: Array.isArray(result.detected_chemicals) ? result.detected_chemicals : [],
        diseases: Array.isArray(result.diseases) ? result.diseases : [],
        nutrition_issues: Array.isArray(result.nutrition_issues) ? result.nutrition_issues : [],
        recommendation: result.recommendation || 'Analysis complete.',
        original_ingredients: result.original_ingredients || ingredients,
        translated_ingredients: result.translated_ingredients || ingredients,
        was_translated: result.was_translated || false,
        food_safety_score: result.food_safety_score ?? 100,
        health_warnings: Array.isArray(result.health_warnings) ? result.health_warnings : [],
        additive_interactions: Array.isArray(result.additive_interactions) ? result.additive_interactions : [],
        processing_level: result.processing_level || 'Unknown'
      };
      
      console.log('Analysis result received:', safeResult);
      
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('analysisResults', JSON.stringify(safeResult));
      
      // Save to history in localStorage
      const historyItem = {
        ...safeResult,
        date: new Date().toISOString()
      };
      const existingHistoryRaw = localStorage.getItem('analysisHistory');
      let existingHistory = [];
      try {
        const parsed = JSON.parse(existingHistoryRaw || '[]');
        existingHistory = Array.isArray(parsed) ? parsed : [];
      } catch (_parseErr) {
        existingHistory = [];
      }
      existingHistory.push(historyItem);
      localStorage.setItem('analysisHistory', JSON.stringify(existingHistory));
      
      // Navigate to results page
      navigate('/results');
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
    setInputText(`Serving Size: 1 Can (355ml)
Calories: 0
Total Fat: 0g
Sodium: 40mg
Total Carbohydrate: 0g
Sugars: 0g
Protein: 0g

Ingredients: Carbonated Water, Citric Acid, Natural Flavors, Aspartame, Potassium Benzoate, Phosphoric Acid`);
  };

  // Handle scan complete from barcode scanner or camera OCR
  const handleScanComplete = (ingredients) => {
    setInputText(ingredients);
    setShowBarcodeScanner(false);
    setShowCameraOCR(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-4">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analyze Food Safety
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Paste nutrition facts or ingredients to detect harmful additives and health risks
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

        {/* Main Analysis Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Section 1 - Nutrition Input */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Nutrition Facts & Ingredients</h2>
                  <p className="text-sm text-slate-400">Paste or type the food label information</p>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-slate-400">Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-10"
                >
                  <option className="bg-slate-800 text-white" value="auto">Auto Detect</option>
                  <option className="bg-slate-800 text-white" value="en">English</option>
                  <option className="bg-slate-800 text-white" value="es">Spanish</option>
                  <option className="bg-slate-800 text-white" value="hi">Hindi</option>
                  <option className="bg-slate-800 text-white" value="kn">Kannada</option>
                </select>
              </div>
            </div>
            
            {/* Health Condition Selector - FEATURE 3 */}
            <div className="flex items-center space-x-2 mb-3">
              <label className="text-sm text-slate-400">Health Mode:</label>
              <select
                value={healthCondition}
                onChange={(e) => setHealthCondition(e.target.value)}
                className="bg-slate-800 text-white border border-purple-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
              >
                <option className="bg-slate-800 text-white" value="">None</option>
                <option className="bg-slate-800 text-white" value="diabetes">Diabetes</option>
                <option className="bg-slate-800 text-white" value="hypertension">Hypertension</option>
                <option className="bg-slate-800 text-white" value="heart_disease">Heart Disease</option>
                <option className="bg-slate-800 text-white" value="kidney_disease">Kidney Disease</option>
              </select>
              <span className="text-xs text-slate-500">Get personalized warnings based on your health condition</span>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              {/* Voice Input Button */}
              <button
                onClick={startVoiceRecognition}
                className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors text-sm font-medium"
                title="Click to use voice input"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Input
              </button>

              {/* Barcode Scanner Button */}
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors text-sm font-medium"
                title="Scan product barcode"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan Barcode
              </button>

              {/* Camera OCR Button */}
              <button
                onClick={() => setShowCameraOCR(true)}
                className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors text-sm font-medium"
                title="Scan ingredient label with camera"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan Label
              </button>
            </div>
            
            <div 
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                isDragging 
                  ? 'border-cyan-500 bg-cyan-500/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Paste Nutrition Facts or Ingredients here...

Example:
Serving Size: 1 Can
Calories: 0
Sodium: 40mg
Ingredients: Carbonated Water, Aspartame, Citric Acid`}
                className="w-full h-64 bg-transparent border-0 p-6 text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
              />
              
              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20 rounded-2xl">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-cyan-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-cyan-400 font-medium">Drop to add text</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <span>Supports drag & drop text</span>
              <button
                onClick={loadExample}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Load Example
              </button>
            </div>
          </div>

          {/* Section 2 - Analyze Button */}
          <div className="p-8 bg-white/5">
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText.trim()}
              className={`w-full relative overflow-hidden group ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {/* Button Background */}
              <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300 ${
                loading ? '' : 'group-hover:scale-[1.02]'
              }`} />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              
              {/* Button Content */}
              <div className="relative px-8 py-5 flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-lg font-semibold text-white">Analyzing ingredients...</span>
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-lg font-semibold text-white">Analyze Food Safety</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-medium text-white">Best Results</h3>
            </div>
            <p className="text-sm text-slate-400">
              Include both nutrition facts and ingredients list for comprehensive analysis
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-white">What We Detect</h3>
            </div>
            <p className="text-sm text-slate-400">
              Harmful additives, hidden sugars, preservatives, and nutritional concerns
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-white">Quick Scan</h3>
            </div>
            <p className="text-sm text-slate-400">
              Use barcode or camera to instantly scan products and labels
            </p>
          </div>
        </div>
      </div>

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
          onScanComplete={handleScanComplete}
          onClose={() => setShowCameraOCR(false)}
        />
      )}
    </Layout>
  );
}

export default Analyze;
