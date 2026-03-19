import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

function BarcodeScanner({ onScanComplete, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [readyToStart, setReadyToStart] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const hasNativeBarcodeDetector =
    typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const pickPreferredDeviceId = (devices = []) => {
    if (!devices.length) return '';
    const virtual = devices.find((d) =>
      d.label && (
        d.label.toLowerCase().includes('virtual') ||
        d.label.toLowerCase().includes('obs') ||
        d.label.toLowerCase().includes('camera hd')
      )
    );
    if (virtual?.deviceId) return virtual.deviceId;

    const back = devices.find((d) =>
      d.label && (
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      )
    );
    return back?.deviceId || devices[0].deviceId || '';
  };

  const refreshVideoDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cams = allDevices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(cams);
      return cams;
    } catch (err) {
      console.warn('Failed to enumerate cameras:', err);
      setVideoDevices([]);
      return [];
    }
  };

  const stopEverything = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (_e) {
        // no-op
      }
      codeReaderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_e) {
          // no-op
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const classifyCameraError = (err) => {
    if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
      return {
        permissionDenied: true,
        message: 'Camera permission denied. Please allow camera access in browser settings.',
      };
    }
    if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
      return {
        permissionDenied: false,
        message: 'Camera is in use by another app/tab. Close it and try again.',
      };
    }
    if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      return {
        permissionDenied: false,
        message: 'No camera device found on this device.',
      };
    }
    if (err?.name === 'OverconstrainedError' || err?.name === 'ConstraintNotSatisfiedError') {
      return {
        permissionDenied: false,
        message: 'Requested camera mode is not available. Trying default camera may help.',
      };
    }
    return {
      permissionDenied: false,
      message: 'Unable to start camera. Please try again.',
    };
  };

  const ensureCameraPreconditions = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        ok: false,
        permissionDenied: false,
        message: 'Camera access is not supported in this browser. Use Chrome, Edge, or Safari.',
      };
    }

    if (!window.isSecureContext) {
      return {
        ok: false,
        permissionDenied: false,
        message: 'Camera access requires HTTPS or localhost.',
      };
    }

    try {
      if (navigator.permissions?.query) {
        const status = await navigator.permissions.query({ name: 'camera' });
        if (status.state === 'denied') {
          return {
            ok: false,
            permissionDenied: true,
            message: 'Camera permission denied. Please allow camera access in browser settings.',
          };
        }
      }
    } catch (_e) {
      // Some browsers do not support this query; continue.
    }

    return { ok: true };
  };

  const fetchProductData = async (barcode) => {
    setLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const ingredients = product.ingredients_text || product.ingredients_text_en || '';

        if (!ingredients) {
          setError('Product found but no ingredients data available.');
          return;
        }

        setScanning(false);
        setProductData({
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || '',
          ingredients,
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

  const startNativeDetectionLoop = () => {
    const tick = async () => {
      if (!mountedRef.current || !detectorRef.current || !videoRef.current) return;

      try {
        if (videoRef.current.readyState >= 2) {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const raw = barcodes[0]?.rawValue;
            if (raw) {
              console.log('Barcode detected (native):', raw);
              stopEverything();
              setScanning(false);
              fetchProductData(raw);
              return;
            }
          }
        }
      } catch (err) {
        // Detector can throw intermittently while camera is initializing.
        console.warn('Native detection tick warning:', err);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const startNativeScanner = async (deviceId) => {
    const videoConstraint = deviceId
      ? { deviceId: { exact: deviceId } }
      : {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraint,
      audio: false
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    detectorRef.current = new window.BarcodeDetector({
      formats: [
        'ean_13',
        'ean_8',
        'upc_a',
        'upc_e',
        'code_128',
        'code_39',
        'itf',
        'qr_code'
      ]
    });

    startNativeDetectionLoop();
  };

  const startZxingScanner = async (deviceId) => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    await codeReaderRef.current.decodeFromVideoDevice(
      deviceId || undefined,
      videoRef.current,
      (result, err) => {
        if (result) {
          const barcode = result.getText();
          console.log('Barcode detected (zxing):', barcode);
          stopEverything();
          setScanning(false);
          fetchProductData(barcode);
        }
        if (err && err.name !== 'NotFoundException') {
          console.error('ZXing scan warning:', err);
        }
      }
    );
  };

  const startScanner = async () => {
    setError(null);
    setInitializing(true);
    setPermissionDenied(false);

    const precheck = await ensureCameraPreconditions();
    if (!precheck.ok) {
      setPermissionDenied(Boolean(precheck.permissionDenied));
      setError(precheck.message);
      setInitializing(false);
      return;
    }

    stopEverything();

    const devices = await refreshVideoDevices();
    const preferredId = selectedDeviceId || pickPreferredDeviceId(devices);
    if (!selectedDeviceId && preferredId) {
      setSelectedDeviceId(preferredId);
    }

    // Try scanner startup with retries to avoid transient camera lock races.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        if (hasNativeBarcodeDetector) {
          await startNativeScanner(preferredId || undefined);
        } else {
          await startZxingScanner(preferredId || undefined);
        }

        if (!mountedRef.current) return;
        setScanning(true);
        setInitializing(false);
        setReadyToStart(false);
        setError(null);
        return;
      } catch (err) {
        console.error(`Scanner start attempt ${attempt} failed:`, err);
        stopEverything();

        const mapped = classifyCameraError(err);
        setPermissionDenied(mapped.permissionDenied);
        setError(attempt < 3 ? `Initializing camera (${attempt}/3)...` : mapped.message);

        if (attempt < 3) {
          // Brief backoff before retry.
          await new Promise((resolve) => {
            retryTimeoutRef.current = setTimeout(resolve, 700 * attempt);
          });
        }
      }
    }

    setScanning(false);
    setInitializing(false);
  };

  useEffect(() => {
    mountedRef.current = true;

    const prepareCameraSelection = async () => {
      setInitializing(true);
      setError(null);
      setPermissionDenied(false);

      const precheck = await ensureCameraPreconditions();
      if (!precheck.ok) {
        setPermissionDenied(Boolean(precheck.permissionDenied));
        setError(precheck.message);
        setInitializing(false);
        setReadyToStart(false);
        return;
      }

      const devices = await refreshVideoDevices();
      const preferredId = pickPreferredDeviceId(devices);
      if (preferredId) {
        setSelectedDeviceId(preferredId);
      }

      setInitializing(false);
      setReadyToStart(true);
    };

    prepareCameraSelection();

    return () => {
      mountedRef.current = false;
      stopEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = async () => {
    setError(null);
    setInitializing(true);
    setScanning(false);
    await startScanner();
  };

  const handleAnalyze = () => {
    if (productData?.ingredients) {
      onScanComplete(productData.ingredients);
    }
  };

  const handleScanAnother = async () => {
    setProductData(null);
    setScanning(false);
    setReadyToStart(true);
  };

  const handleRefreshCameras = async () => {
    const cams = await refreshVideoDevices();
    if (!cams.length) return;
    if (!selectedDeviceId || !cams.some((c) => c.deviceId === selectedDeviceId)) {
      setSelectedDeviceId(pickPreferredDeviceId(cams));
    }
  };

  const handleClose = () => {
    stopEverything();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
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
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
              <div className="relative aspect-square bg-black rounded-2xl overflow-hidden mb-4">
                {initializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-3" />
                    <span className="text-slate-400 text-sm">Initializing camera...</span>
                  </div>
                )}

                {permissionDenied && !initializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                    <svg className="w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span className="text-red-400 text-sm text-center px-4">
                      Camera access blocked. Please enable camera permissions.
                    </span>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '320px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />

                {scanning && !initializing && !permissionDenied && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-40 border-2 border-cyan-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-500 rounded-br-lg" />
                      <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-cyan-500/50 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              <p className="text-center text-slate-400 text-sm mb-4">
                {permissionDenied ? 'Enable camera permission to scan barcodes' : 'Position the barcode within the frame to scan'}
              </p>

              {videoDevices.length > 1 && (
                <div className="mb-4 grid grid-cols-[1fr_auto] gap-2">
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="rounded-xl border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
                  >
                    {videoDevices.map((device, idx) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSwitchCamera}
                    className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
                  >
                    Switch
                  </button>
                </div>
              )}

              <button
                onClick={handleRefreshCameras}
                className="mb-4 w-full rounded-xl border border-white/20 bg-white/5 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                Refresh Cameras
              </button>

              {readyToStart && !initializing && (
                <button
                  onClick={startScanner}
                  className="w-full py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                >
                  {permissionDenied ? 'Try Again' : 'Start Scanning'}
                </button>
              )}

              {!readyToStart && (permissionDenied || !scanning) && !initializing && (
                <button
                  onClick={handleScanAnother}
                  className="w-full py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                >
                  Start Scanning
                </button>
              )}
            </>
          )}

          {productData && !loading && (
            <div className="space-y-4">
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
                  {productData.brand && <p className="text-sm text-slate-400">{productData.brand}</p>}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Ingredients</h4>
                <p className="text-sm text-slate-300 max-h-32 overflow-y-auto">
                  {productData.ingredients}
                </p>
              </div>

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
