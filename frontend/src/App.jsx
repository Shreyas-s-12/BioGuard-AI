import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
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
import SelectMode from "./pages/SelectMode";
import PersonalCareHome from "./pages/personal-care/PersonalCareHome";
import PersonalCareAnalyze from "./pages/personal-care/PersonalCareAnalyze";
import PersonalCareDatabase from "./pages/personal-care/PersonalCareDatabase";
import PersonalCareGuide from "./pages/personal-care/PersonalCareGuide";
import PersonalCareAbout from "./pages/personal-care/PersonalCareAbout";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatAssistant from "./components/ChatAssistant";
import PersonalCareChatbot from "./components/PersonalCareChatbot";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

function PageWrapper({ children }) {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300`}>
      {children}
    </div>
  );
}

function LayoutWrapper() {
  const location = useLocation();
  const isPersonalCare = location.pathname.startsWith('/personal-care');
  
  // Pages that don't show Navbar
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/login/google" ||
    location.pathname === "/select-mode";
  
  const hideChatAssistant = hideNavbar;

  // Custom layout with Navbar for both Food and Personal Care pages
  return (
    <PageWrapper>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/google" element={<LoginGoogle />} />

        {/* Food Safety Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/chemicals" element={<ProtectedRoute><Chemicals /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><CompareFoods /></ProtectedRoute>} />
        <Route path="/daily-tracker" element={<ProtectedRoute><DailyTracker /></ProtectedRoute>} />
        <Route path="/select-mode" element={<ProtectedRoute><SelectMode /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Personal Care Routes - Using Layout for sidebar */}
        <Route path="/personal-care" element={<ProtectedRoute><Layout><PersonalCareHome /></Layout></ProtectedRoute>} />
        <Route path="/personal-care/analyze" element={<ProtectedRoute><Layout><PersonalCareAnalyze /></Layout></ProtectedRoute>} />
        <Route path="/personal-care/database" element={<ProtectedRoute><Layout><PersonalCareDatabase /></Layout></ProtectedRoute>} />
        <Route path="/personal-care/guide" element={<ProtectedRoute><Layout><PersonalCareGuide /></Layout></ProtectedRoute>} />
        <Route path="/personal-care/about" element={<ProtectedRoute><Layout><PersonalCareAbout /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isPersonalCare && !hideChatAssistant && <PersonalCareChatbot />}
      {!isPersonalCare && !hideChatAssistant && <ChatAssistant />}
    </PageWrapper>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LayoutWrapper />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
