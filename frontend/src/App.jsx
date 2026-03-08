import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import Chemicals from './pages/Chemicals';
import About from './pages/About';
import Login from './pages/Login';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results" element={<Results />} />
        <Route path="/chemicals" element={<Chemicals />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
