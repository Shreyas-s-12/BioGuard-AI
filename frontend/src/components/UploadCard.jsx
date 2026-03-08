import { useState, useCallback } from 'react';

function UploadCard({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      await onUpload(file);
    }
  }, [onUpload]);

  const handleInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      await onUpload(file);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 bg-nutri-primary/20 rounded-lg flex items-center justify-center mr-2">
          📷
        </span>
        Upload Food Label
      </h2>
      
      <div 
        className={`upload-zone rounded-xl p-8 text-center ${dragActive ? 'dragging' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="spinner w-12 h-12 mb-4"></div>
            <p className="text-slate-400">Analyzing food label...</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg mb-4" />
            <p className="text-nutri-primary font-medium">✓ Image uploaded successfully!</p>
            <p className="text-slate-400 text-sm mt-1">Click "Analyze Food" to start analysis</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Drop your food label image here</p>
            <p className="text-slate-400 text-sm mb-4">or click to browse</p>
            <label className="inline-flex items-center px-4 py-2 bg-nutri-primary hover:bg-nutri-primary/80 text-white rounded-lg cursor-pointer transition">
              <span>Select Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleInputChange}
              />
            </label>
            <p className="text-xs text-slate-500 mt-4">Supports JPG, PNG, WEBP</p>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadCard;
