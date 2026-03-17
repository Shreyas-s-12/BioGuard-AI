import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import Chemicals from "./pages/Chemicals";
import About from "./pages/About";
import Guide from "./pages/Guide";
import Login from "./pages/Login";
import LoginGoogle from "./pages/LoginGoogle";
import History from "./pages/History";
import CompareFoods from "./pages/CompareFoods";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatAssistant from "./components/ChatAssistant";
import { AuthProvider } from "./context/AuthContext";

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/login/google";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/google" element={<LoginGoogle />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/chemicals" element={<ProtectedRoute><Chemicals /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><CompareFoods /></ProtectedRoute>} />
      </Routes>

      <ChatAssistant />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
