import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function LoginGoogle() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  // If already logged in, redirect to select-mode
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/select-mode");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    const currentOrigin = window.location.origin;
    console.log("Current Origin:", currentOrigin);
    
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      console.log("Auth success:", firebaseUser);

      login({
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        uid: firebaseUser.uid,
        method: "google"
      });

      navigate("/select-mode");
    } catch (error) {
      console.error("Google login error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Handle specific Firebase auth errors
      if (error.code === "auth/popup-closed-by-user") {
        alert("Sign-in popup was closed. Please try again.");
      } else if (error.code === "auth/cancelled-popup-request") {
        // Ignore this error - user cancelled multiple popups
      } else if (error.code === "auth/account-exists-with-different-credential") {
        alert("An account already exists with a different sign-in method. Please use the original method.");
      } else if (error.code === "auth/auth-domain-config-error") {
        alert("Firebase auth domain configuration error. Please check Firebase console.");
      } else if (error.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized in Firebase. Please add " + currentOrigin + " to authorized domains in Firebase Console → Authentication → Settings.");
      } else if (error.code && error.code.includes("redirect_uri")) {
        alert("Redirect URI mismatch. Please check:\n\n1. Firebase Console → Authentication → Settings → Authorized domains\n2. Google Cloud Console → Credentials\n\nCurrent domain: " + currentOrigin);
      } else {
        alert("Google login failed: " + error.message);
      }
    }
  };

  // Auto-trigger Google login on page load
  useEffect(() => {
    handleGoogleLogin();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      {/* LOGO */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-3">
          <span className="text-white text-2xl">🛡</span>
        </div>
        <h1 className="text-3xl font-bold text-cyan-400">
          BioGuard AI
        </h1>
        <p className="text-gray-400 text-sm">
          Smart Food Safety Platform
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="w-[420px] bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Sign in with Google
        </h2>
        
        <p className="text-gray-400 text-sm mb-6">
          Click the button below to continue with your Google account
        </p>

        {/* GOOGLE LOGIN BUTTON */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded mb-4 hover:opacity-90 transition-opacity"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5"
            alt="Google"
          />
          Continue with Google
        </button>

        {/* BACK TO LOGIN */}
        <button
          onClick={() => navigate("/login")}
          className="text-cyan-400 text-sm hover:underline"
        >
          ← Back to login options
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
