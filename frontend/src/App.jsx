import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import Chemicals from "./pages/Chemicals";
import About from "./pages/About";
import Guide from "./pages/Guide";
import Login from "./pages/Login";
import History from "./pages/History";
import ChatAssistant from "./components/ChatAssistant";
import CompareFoods from "./pages/CompareFoods";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage on app load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setUser(parsedUser);
        }
      } catch (e) {
        // Invalid JSON, treat as not logged in
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // If no user is found in localStorage, show Login page
  if (!isLoading && !user) {
    return <Login />;
  }

  // If user exists, render the main application with routing
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results" element={<Results />} />
        <Route path="/chemicals" element={<Chemicals />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/compare" element={<CompareFoods />} />
        {/* Default route - redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
      <ChatAssistant />
    </Router>
  );
}

export default App;
