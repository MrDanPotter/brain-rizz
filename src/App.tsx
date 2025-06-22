import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import page components
import MemoryPage from './pages/memory';
import AttentionPage from './pages/attention';
import ProblemSolvingPage from './pages/problem-solving';

interface Section {
  name: string;
  path: string;
}

const sections: Section[] = [
  { name: 'Memory', path: '/memory' },
  { name: 'Attention', path: '/attention' },
  { name: 'Problem-Solving', path: '/problem-solving' },
];

function Header(): React.ReactElement {
  const location = useLocation();
  return (
    <header className="br-header">
      <h1 className="br-title">Brain Rizz</h1>
      <nav className="br-nav">
        {sections.map((section) => (
          <Link
            key={section.name}
            to={section.path}
            className={`br-nav-btn${location.pathname === section.path ? ' active' : ''}`}
          >
            {section.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function App(): React.ReactElement {
  return (
    <Router>
      <Header />
      <main className="br-main">
        <Routes>
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/attention" element={<AttentionPage />} />
          <Route path="/problem-solving" element={<ProblemSolvingPage />} />
          <Route path="*" element={<MemoryPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App; 