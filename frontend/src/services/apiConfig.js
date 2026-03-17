// API Configuration for Capacitor
// This file handles the API URL for different platforms

// Check if running in Capacitor (mobile app)
const isCapacitor = () => {
  return window.Capacitor?.isNativePlatform?.() || false;
};

// Get the appropriate API URL based on platform
// For Android emulator: use 10.0.2.2 to connect to host's localhost
// For web: use localhost
export const getApiUrl = () => {
  if (isCapacitor()) {
    return 'http://10.0.2.2:8000'; // Android emulator connects to host via 10.0.2.2
  }
  return 'http://127.0.0.1:8000'; // Web/development
};

export default getApiUrl;
