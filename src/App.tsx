import React, { useState } from 'react';
import './App.css';

// Import page components
import MemoryPage from './pages/memory';
import AttentionPage from './pages/attention';
import ProblemSolvingPage from './pages/problem-solving';
import PWAInstallPrompt from './components/PWAInstallPrompt';

interface Section {
  name: string;
  id: string;
}

const sections: Section[] = [
  { name: 'Memory', id: 'memory' },
  { name: 'Attention', id: 'attention' },
  { name: 'Problem-Solving', id: 'problem-solving' },
];

function Header({ 
  onInstallClick, 
  currentSection, 
  onSectionChange 
}: { 
  onInstallClick: () => void;
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
}): React.ReactElement {
  return (
    <header className="br-header">
      <h1 className="br-title">Brain Rizz</h1>
      <nav className="br-nav">
        {sections.map((section) => (
          <button
            key={section.name}
            onClick={() => onSectionChange(section.id)}
            className={`br-nav-btn${currentSection === section.id ? ' active' : ''}`}
          >
            {section.name}
          </button>
        ))}
        <button 
          onClick={onInstallClick}
          className="br-install-btn"
          title="Install Brain Rizz App"
        >
          📱 Install
        </button>
      </nav>
    </header>
  );
}

function App(): React.ReactElement {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [currentSection, setCurrentSection] = useState('memory');

  const handleInstallClick = () => {
    console.log('Install button clicked, opening modal...');
    setShowInstallModal(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal...');
    setShowInstallModal(false);
  };

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'memory':
        return <MemoryPage />;
      case 'attention':
        return <AttentionPage />;
      case 'problem-solving':
        return <ProblemSolvingPage />;
      default:
        return <MemoryPage />;
    }
  };

  return (
    <>
      <Header 
        onInstallClick={handleInstallClick} 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      <main className="br-main">
        {renderCurrentSection()}
      </main>
      <PWAInstallPrompt isOpen={showInstallModal} onClose={handleCloseModal} />
    </>
  );
}

export default App; 