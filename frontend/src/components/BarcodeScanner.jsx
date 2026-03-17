import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

function BarcodeScanner({ onScanComplete, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Request camera permission
  async function requestCameraPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (error) {
      console.error("Camera permission denied:", error);
      return false;
    }
  }

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        setError(null);
        setInitializing(true);
        setPermissionDenied(false);

        // Check if browser supports mediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera access is not supported in this browser. Please use Chrome, Edge, or Safari.');
          setInitializing(false);
          return;
        }

        // Request camera permission explicitly
        const permissionGranted = await requestCameraPermission();

        if (!permissionGranted) {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access in browser settings.');
          setInitializing(false);
          alert("Camera access is required to scan barcodes. Please allow camera permission in browser settings.");
          return;
        }

        // Initialize the code reader
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        // Get available devices using ZXing's method
        let devices = [];
        try {
          devices = await BrowserMultiFormatReader.listVideoInputDevices();
        } catch (err) {
          console.error("Failed to list devices:", err);
        }

        if (!devices || devices.length === 0) {
          setError('No camera devices found.');
          setInitializing(false);
          return;
        }

        // Try to get the back camera (usually the last one on mobile)
        let selectedDeviceId = devices[0].deviceId;
        const backCamera = devices.find(device => 
          device.label && (device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear'))
        );
        if (backCamera) {
          selectedDeviceId = backCamera.deviceId;
        }

        if (!mounted) return;

        // Start decoding - use a slight delay to ensure video element is ready
        setTimeout(() => {
          if (!mounted || !codeReaderRef.current || !videoRef.current) return;

          codeReaderRef.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                // Barcode detected
                const barcode = result.getText();
                console.log('Barcode detected:', barcode);
                
                // Stop scanning
                if (codeReaderRef.current) {
                  codeReaderRef.current.reset();
                }
                
                // Fetch product data from OpenFoodFacts
                fetchProductData(barcode);
              }
              if (err && !(err.name === 'NotFoundException')) {
                console.error('Scan error:', err);
              }
            }
          );

          setScanning(true);
          setInitializing(false);
        }, 500);

      } catch (err) {
        console.error('Failed to start scanning:', err);
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        setInitializing(false);
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const fetchProductData = async (barcode) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const ingredients = product.ingredients_text || 
                           product.ingredients_text_en || 
                           '';
        
        if (!ingredients) {
          setError('Product found but no ingredients data available.');
          setLoading(false);
          return;
        }

        // Stop the scanner
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
        setScanning(false);

        setProductData({
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || '',
          ingredients: ingredients,
          image: product.image_url || ''
        });
      } else {
        setError('Product not found in OpenFoodFacts database.');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to fetch product data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (productData && productData.ingredients) {
      onScanComplete(productData.ingredients);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
    setProductData(null);
    setError(null);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleScanAnother = async () => {
    setProductData(null);
    setError(null);
    setPermissionDenied(false);
    setInitializing(true);
    
    // Restart the scanner
    try {
      // Request camera permission first
      const permissionGranted = await requestCameraPermission();

      if (!permissionGranted) {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access in browser settings.');
        setInitializing(false);
        return;
      }

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (!devices || devices.length === 0) {
        setError('No camera devices found.');
        setInitializing(false);
        return;
      }

      let selectedDeviceId = devices[0].deviceId;
      const backCamera = devices.find(device => 
        device.label && (device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear'))
      );
      if (backCamera) {
        selectedDeviceId = backCamera.deviceId;
      }

      codeReaderRef.current = new BrowserMultiFormatReader();
      
      setTimeout(() => {
        if (!codeReaderRef.current || !videoRef.current) return;

        codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const barcode = result.getText();
              console.log('Barcode detected:', barcode);
              
              if (codeReaderRef.current) {
                codeReaderRef.current.reset();
              }
              
              fetchProductData(barcode);
            }
            if (err && !(err.name === 'NotFoundException')) {
              console.error('Scan error:', err);
            }
          }
        );

        setScanning(true);
        setInitializing(false);
      }, 500);

    } catch (err) {
      console.error('Failed to restart scanning:', err);
      setError('Failed to access camera. Please try again.');
      setInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Barcode Scanner</h2>
              <p className="text-sm text-slate-400">Scan product barcode</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="ml-3 text-slate-400">Fetching product data...</span>
            </div>
          )}

          {!productData && !loading && (
            <>
              {/* Camera Preview */}
              <div className="relative aspect-square bg-black rounded-2xl overflow-hidden mb-4">
                {/* Loading state */}
                {initializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-3" />
                    <span className="text-slate-400 text-sm">Initializing camera...</span>
                  </div>
                )}

                {/* Permission denied message */}
                {permissionDenied && !initializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                    <svg className="w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span className="text-red-400 text-sm text-center px-4">Camera access blocked. Please enable camera permissions.</span>
                  </div>
                )}

                {/* Video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "320px",
                    objectFit: "cover",
                    borderRadius: "12px"
                  }}
                />

                {/* Scanning overlay */}
                {scanning && !initializing && !permissionDenied && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-40 border-2 border-cyan-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-500 rounded-br-lg" />
                      {/* Scanning line animation */}
                      <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-cyan-500/50 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {permissionDenied ? (
                <p className="text-center text-slate-400 text-sm mb-4">
                  Enable camera permissions to scan barcodes
                </p>
              ) : (
                <p className="text-center text-slate-400 text-sm mb-4">
                  Position the barcode within the frame to scan
                </p>
              )}

              {/* Action buttons */}
              {(permissionDenied || !scanning) && !initializing && (
                <button
                  onClick={handleScanAnother}
                  className="w-full py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                >
                  {permissionDenied ? 'Try Again' : 'Start Scanning'}
                </button>
              )}
            </>
          )}

          {productData && !loading && (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
                {productData.image && (
                  <img
                    src={productData.image}
                    alt={productData.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{productData.name}</h3>
                  {productData.brand && (
                    <p className="text-sm text-slate-400">{productData.brand}</p>
                  )}
                </div>
              </div>

              {/* Ingredients Preview */}
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Ingredients</h4>
                <p className="text-sm text-slate-300 max-h-32 overflow-y-auto">
                  {productData.ingredients}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleScanAnother}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-xl font-medium transition-colors"
                >
                  Analyze Ingredients
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
