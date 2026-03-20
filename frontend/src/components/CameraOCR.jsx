import { useState, useRef } from 'react';
import { getApiUrl } from '../services/apiConfig';

function CameraOCR({ onScanComplete, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setOcrResult(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${getApiUrl()}/ocr`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let detail = 'OCR processing failed';
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            detail = errorData.detail;
          }
        } catch (_) {
          // Keep generic fallback detail.
        }
        throw new Error(detail);
      }

      const data = await response.json();
      
      // Check for OCR text - if no text, show error
      if (!data.ocr_text) {
        setError('OCR could not detect text.');
        return;
      }
      
      // Extract ingredients from the response (now an array)
      const ingredients = data.extracted_ingredients || [];
      
      setOcrResult({
        ocr_text: data.ocr_text,
        ingredients: ingredients
      });
    } catch (err) {
      console.error('OCR error:', err);
      setError(err?.message || 'Unable to read label. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (ocrResult && ocrResult.ingredients) {
      // Join the ingredients array for analysis
      const ingredientsText = Array.isArray(ocrResult.ingredients) 
        ? ocrResult.ingredients.join(', ') 
        : ocrResult.ingredients;
      onScanComplete(ingredientsText);
    }
  };

  const resetAndScanAgain = () => {
    setOcrResult(null);
    setError(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Helper function to display ingredients (array or string)
  const displayIngredients = () => {
    if (!ocrResult || !ocrResult.ingredients) return '';
    if (Array.isArray(ocrResult.ingredients)) {
      return ocrResult.ingredients.join(', ');
    }
    return ocrResult.ingredients;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Ingredient Label Scanner</h2>
              <p className="text-sm text-slate-400">Upload a food label image to extract ingredients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <span className="ml-3 text-slate-400">Processing image...</span>
            </div>
          )}

          {/* Upload UI - shown when no image is selected */}
          {!ocrResult && !loading && !previewUrl && (
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-base font-medium text-white mb-2">Upload Food Label</h3>
              <p className="text-slate-400 text-xs mb-4">
                Upload a food label image to extract ingredients
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="ingredientUpload"
              />

              <label
                htmlFor="ingredientUpload"
                className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-lg cursor-pointer transition-all text-sm"
              >
                Upload Food Label Image
              </label>
            </div>
          )}

          {/* Image Preview - shown when image is selected but OCR not done */}
          {previewUrl && !ocrResult && !loading && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={resetAndScanAgain}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Choose Different Image
                </button>
              </div>
            </div>
          )}

          {/* OCR Result - shown when OCR is complete */}
          {ocrResult && !loading && (
            <div className="space-y-4">
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden mb-4">
                  <img
                    src={previewUrl}
                    alt="Uploaded"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Extracted OCR Text */}
              {ocrResult.ocr_text && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                  <h3 className="font-semibold mb-2 text-white">Extracted Text</h3>
                  <p className="text-gray-300">{ocrResult.ocr_text}</p>
                </div>
              )}

              {/* Extracted Ingredients */}
              <div className="p-4 bg-slate-800 rounded-xl">
                <h4 className="font-semibold mb-2 text-white">Extracted Ingredients</h4>
                <p className="text-gray-300 max-h-40 overflow-y-auto text-sm">
                  {displayIngredients()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={resetAndScanAgain}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Scan Another Image
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-400 hover:to-pink-400 text-white rounded-xl font-medium transition-colors"
                >
                  Analyze Food Safety
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraOCR;
