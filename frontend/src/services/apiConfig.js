// API Configuration for Capacitor
// This file handles the API URL for different platforms

// Check if running in Capacitor (mobile app)
const isCapacitor = () => {
  return window.Capacitor?.isNativePlatform?.() || false;
};

// Get the appropriate API URL based on platform
// Priority: Environment Variable > Capacitor > Local Development
export const getApiUrl = () => {
  // Check for environment variable (Vercel production)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Check if running in Capacitor (mobile app)
  if (isCapacitor()) {
    // Android emulator: 10.0.2.2 connects to host
    // Physical device: needs actual server URL
    return 'http://10.0.2.2:8000';
  }
  
  // Default: Local development
  return 'http://127.0.0.1:8000';
};

export default getApiUrl;
