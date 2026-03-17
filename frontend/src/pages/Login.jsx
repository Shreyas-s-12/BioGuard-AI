import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {

  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Prevent redirect loop
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const loginGoogle = () => {
    navigate("/login/google");
  };

  const loginGmail = () => {

    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    login({
      name,
      email,
      method: "gmail"
    });

    navigate("/");
  };

  return (

    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">

      {/* LOGO */}
      <div className="text-center mb-8">

        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-3">
          <span className="text-white text-2xl">🛡</span>
        </div>

        <h1 className="text-3xl font-bold text-cyan-400">
          NutriDetect AI
        </h1>

        <p className="text-gray-400 text-sm">
          Smart Food Safety Platform
        </p>

      </div>

      {/* LOGIN CARD */}

      <div className="w-[420px] bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 p-8">

        <h2 className="text-xl text-center font-semibold mb-2">
          Welcome Back
        </h2>

        <p className="text-center text-gray-400 text-sm mb-6">
          Sign in to access your analysis history
        </p>

        {/* NAME */}

        <input
          placeholder="Your Name"
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          onChange={(e) => setName(e.target.value)}
        />

        {/* GOOGLE LOGIN */}

        <button
          onClick={loginGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded mb-4 hover:opacity-90"
        >

          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5"
          />

          Continue with Google

        </button>

        {/* EMAIL */}

        <input
          placeholder="Gmail Address"
          className="w-full p-3 mb-3 rounded bg-slate-700 text-white"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-slate-700 text-white"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* GMAIL LOGIN */}

        <button
          onClick={loginGmail}
          className="w-full bg-cyan-500 py-3 rounded hover:bg-cyan-600"
        >
          Continue with Gmail
        </button>

        {/* MOBILE (OPTIONAL BUTTON) */}

        <button
          className="w-full bg-slate-700 py-3 rounded mt-4"
        >
          Continue with Mobile Number
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>

      </div>

    </div>
  );
}