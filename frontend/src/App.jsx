import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import GetStarted from "./pages/GetStarted";
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
import DailyTracker from "./pages/DailyTracker";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatAssistant from "./components/ChatAssistant";
import { AuthProvider } from "./context/AuthContext";

function Layout() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/login/google";
  const hideChatAssistant = hideNavbar;

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/google" element={<LoginGoogle />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/chemicals" element={<ProtectedRoute><Chemicals /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><CompareFoods /></ProtectedRoute>} />
        <Route path="/daily-tracker" element={<ProtectedRoute><DailyTracker /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideChatAssistant && <ChatAssistant />}
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
