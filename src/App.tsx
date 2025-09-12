import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import page components
import MemoryPage from './pages/memory';
import AttentionPage from './pages/attention';
import ProblemSolvingPage from './pages/problem-solving';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { isInStandalone } from './utils/pwaUtils';

interface Section {
  name: string;
  path: string;
}

const sections: Section[] = [
  { name: 'Memory', path: '/memory' },
  { name: 'Attention', path: '/attention' },
  { name: 'Problem-Solving', path: '/problem-solving' },
];

function Header({ onInstallClick }: { onInstallClick: () => void }): React.ReactElement {
  const location = useLocation();
  
  // Only show install button if not already installed
  const shouldShowInstallButton = !isInStandalone();

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
        {shouldShowInstallButton && (
          <button 
            onClick={onInstallClick}
            className="br-install-btn"
            title="Install Brain Rizz App"
          >
            📱 Install
          </button>
        )}
      </nav>
    </header>
  );
}

function App(): React.ReactElement {
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleInstallClick = () => {
    console.log('Install button clicked, opening modal...');
    setShowInstallModal(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal...');
    setShowInstallModal(false);
  };

  return (
    <Router>
      <Header onInstallClick={handleInstallClick} />
      <main className="br-main">
        <Routes>
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/attention" element={<AttentionPage />} />
          <Route path="/problem-solving" element={<ProblemSolvingPage />} />
          <Route path="*" element={<MemoryPage />} />
        </Routes>

      </main>
      <PWAInstallPrompt isOpen={showInstallModal} onClose={handleCloseModal} />
    </Router>
  );
}

export default App; 