import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MemoryPage.css';

interface GameConfig {
  gridSize: number;
  tileCount: number;
  stimulusTime: number;
  sessionRounds: number;
  inactivityTimeout: number;
}

interface GameState {
  phase: 'config' | 'stimulus' | 'recall' | 'feedback' | 'roundScore' | 'sessionEnd';
  currentRound: number;
  score: number;
  highlightedTiles: Set<string>;
  selectedTiles: Set<string>;
  correctTiles: Set<string>;
  incorrectTiles: Set<string>;
  roundScore: number;
  totalScore: number;
  lastActivityTime: number;
  consecutiveInactiveRounds: number;
}

const MemoryPage: React.FC = () => {
  const [config, setConfig] = useState<GameConfig>({
    gridSize: 3,
    tileCount: 2,
    stimulusTime: 1000,
    sessionRounds: 5,
    inactivityTimeout: 15000
  });

  const [gameState, setGameState] = useState<GameState>({
    phase: 'config',
    currentRound: 1,
    score: 0,
    highlightedTiles: new Set(),
    selectedTiles: new Set(),
    correctTiles: new Set(),
    incorrectTiles: new Set(),
    roundScore: 0,
    totalScore: 0,
    lastActivityTime: Date.now(),
    consecutiveInactiveRounds: 0
  });

  const inactivityTimerRef = useRef<number | null>(null);
  const stimulusTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  // End session
  const endSession = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'sessionEnd'
    }));
  }, []);

  // Generate random highlighted tiles
  const generatePattern = useCallback((size: number, count: number): Set<string> => {
    const tiles = new Set<string>();
    const totalCells = size * size;
    
    while (tiles.size < count && tiles.size < totalCells) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const tileKey = `${row}-${col}`;
      tiles.add(tileKey);
    }
    
    return tiles;
  }, []);

  // Start inactivity timer
  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = window.setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        consecutiveInactiveRounds: prev.consecutiveInactiveRounds + 1
      }));
      
      if (gameState.consecutiveInactiveRounds >= 1) {
        endSession();
      } else {
        submitRound();
      }
    }, config.inactivityTimeout);
  }, [config.inactivityTimeout, gameState.consecutiveInactiveRounds, endSession]);

  // Start a new round
  const startRound = useCallback(() => {
    const highlightedTiles = generatePattern(config.gridSize, config.tileCount);
    
    setGameState(prev => ({
      ...prev,
      phase: 'stimulus',
      highlightedTiles,
      selectedTiles: new Set(),
      correctTiles: new Set(),
      incorrectTiles: new Set(),
      roundScore: 0,
      lastActivityTime: Date.now()
    }));

    // Clear stimulus after configured time
    stimulusTimerRef.current = window.setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        phase: 'recall'
      }));
      startInactivityTimer();
    }, config.stimulusTime);
  }, [config.gridSize, config.tileCount, config.stimulusTime, generatePattern, startInactivityTimer]);

  // Reset inactivity timer on activity
  const resetInactivityTimer = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      lastActivityTime: Date.now(),
      consecutiveInactiveRounds: 0
    }));
    
    if (gameState.phase === 'recall') {
      startInactivityTimer();
    }
  }, [gameState.phase, startInactivityTimer]);

  // Handle tile selection during recall
  const handleTileClick = useCallback((row: number, col: number) => {
    if (gameState.phase !== 'recall') return;
    
    resetInactivityTimer();
    
    const tileKey = `${row}-${col}`;
    setGameState(prev => {
      const newSelectedTiles = new Set(prev.selectedTiles);
      
      if (newSelectedTiles.has(tileKey)) {
        newSelectedTiles.delete(tileKey);
      } else {
        newSelectedTiles.add(tileKey);
      }
      
      return {
        ...prev,
        selectedTiles: newSelectedTiles
      };
    });
  }, [gameState.phase, resetInactivityTimer]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState.phase !== 'recall') return;
    
    resetInactivityTimer();
    
    // Arrow key navigation logic would go here
    // For now, just reset the timer on any key press
  }, [gameState.phase, resetInactivityTimer]);

  // Submit round and calculate score
  const submitRound = useCallback(() => {
    if (gameState.phase !== 'recall') return;
    
    const correctTiles = new Set<string>();
    const incorrectTiles = new Set<string>();
    
    // Check each selected tile
    gameState.selectedTiles.forEach(tileKey => {
      if (gameState.highlightedTiles.has(tileKey)) {
        correctTiles.add(tileKey);
      } else {
        incorrectTiles.add(tileKey);
      }
    });
    
    // Calculate score
    const correctCount = correctTiles.size;
    const roundScore = correctCount * 250;
    const flawlessBonus = correctCount === gameState.highlightedTiles.size && 
                         gameState.selectedTiles.size === gameState.highlightedTiles.size ? 100 : 0;
    const totalRoundScore = roundScore + flawlessBonus;
    
    setGameState(prev => ({
      ...prev,
      phase: 'feedback',
      correctTiles,
      incorrectTiles,
      roundScore: totalRoundScore,
      totalScore: prev.totalScore + totalRoundScore
    }));
    
    // Show feedback for 1 second
    feedbackTimerRef.current = window.setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        phase: 'roundScore'
      }));
      
      // Show round score for 2 seconds
      window.setTimeout(() => {
        if (gameState.currentRound >= config.sessionRounds) {
          endSession();
        } else {
          setGameState(prev => ({
            ...prev,
            phase: 'stimulus',
            currentRound: prev.currentRound + 1
          }));
          startRound();
        }
      }, 2000);
    }, 1000);
  }, [gameState, config.sessionRounds, startRound, endSession]);

  // Start new session
  const startSession = useCallback(() => {
    setGameState({
      phase: 'stimulus',
      currentRound: 1,
      score: 0,
      highlightedTiles: new Set(),
      selectedTiles: new Set(),
      correctTiles: new Set(),
      incorrectTiles: new Set(),
      roundScore: 0,
      totalScore: 0,
      lastActivityTime: Date.now(),
      consecutiveInactiveRounds: 0
    });
    
    startRound();
  }, [startRound]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
      if (stimulusTimerRef.current) window.clearTimeout(stimulusTimerRef.current);
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Render grid cell
  const renderCell = (row: number, col: number) => {
    const tileKey = `${row}-${col}`;
    const isHighlighted = gameState.highlightedTiles.has(tileKey);
    const isSelected = gameState.selectedTiles.has(tileKey);
    const isCorrect = gameState.correctTiles.has(tileKey);
    const isIncorrect = gameState.incorrectTiles.has(tileKey);
    
    let className = 'memory-cell';
    let ariaLabel = `Row ${row + 1}, Column ${col + 1}`;
    
    if (gameState.phase === 'stimulus' && isHighlighted) {
      className += ' highlighted';
      ariaLabel += ', highlighted';
    } else if (gameState.phase === 'recall') {
      if (isSelected) {
        className += ' selected';
        ariaLabel += ', selected';
      }
    } else if (gameState.phase === 'feedback') {
      if (isCorrect) {
        className += ' correct';
        ariaLabel += ', correct selection';
      } else if (isIncorrect) {
        className += ' incorrect';
        ariaLabel += ', incorrect selection';
      } else if (isHighlighted) {
        className += ' missed';
        ariaLabel += ', missed tile';
      }
    }
    
    return (
      <button
        key={tileKey}
        className={className}
        onClick={() => handleTileClick(row, col)}
        disabled={gameState.phase !== 'recall'}
        aria-label={ariaLabel}
        tabIndex={gameState.phase === 'recall' ? 0 : -1}
      />
    );
  };

  // Render configuration screen
  if (gameState.phase === 'config') {
    return (
      <div className="memory-page">
        <div className="game-config">
          <h2>Memory Pattern Game</h2>
          <p>Configure your game settings:</p>
          
          <div className="config-options">
            <div className="config-group">
              <label htmlFor="gridSize">Grid Size:</label>
              <select
                id="gridSize"
                value={config.gridSize}
                onChange={(e) => setConfig(prev => ({ ...prev, gridSize: parseInt(e.target.value) }))}
              >
                {[2, 3, 4, 5, 6, 7].map(size => (
                  <option key={size} value={size}>{size} × {size}</option>
                ))}
              </select>
            </div>
            
            <div className="config-group">
              <label htmlFor="tileCount">Number of Tiles:</label>
              <input
                id="tileCount"
                type="number"
                min="1"
                max={config.gridSize * config.gridSize}
                value={config.tileCount}
                onChange={(e) => setConfig(prev => ({ ...prev, tileCount: parseInt(e.target.value) }))}
              />
            </div>
            
            <div className="config-group">
              <label htmlFor="stimulusTime">Display Time (ms):</label>
              <input
                id="stimulusTime"
                type="number"
                min="500"
                max="2000"
                step="100"
                value={config.stimulusTime}
                onChange={(e) => setConfig(prev => ({ ...prev, stimulusTime: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <button className="start-btn" onClick={startSession}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Render session end screen
  if (gameState.phase === 'sessionEnd') {
    return (
      <div className="memory-page">
        <div className="session-end">
          <h2>Session Complete!</h2>
          <div className="final-stats">
            <div className="stat">
              <span className="stat-label">Total Score:</span>
              <span className="stat-value">{gameState.totalScore}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rounds Played:</span>
              <span className="stat-value">{gameState.currentRound}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Highest Tile Count:</span>
              <span className="stat-value">{config.tileCount}</span>
            </div>
          </div>
          
          <div className="session-actions">
            <button className="play-again-btn" onClick={() => setGameState(prev => ({ ...prev, phase: 'config' }))}>
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render game grid
  return (
    <div className="memory-page">
      <div className="game-header">
        <div className="game-info">
          <span className="round-info">Round {gameState.currentRound} of {config.sessionRounds}</span>
          <span className="score-info">Score: {gameState.totalScore}</span>
        </div>
        
        {gameState.phase === 'recall' && (
          <button className="submit-btn" onClick={submitRound}>
            Submit ({gameState.selectedTiles.size}/{config.tileCount})
          </button>
        )}
      </div>
      
      <div className="game-grid-container">
        <div 
          className="game-grid"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${config.gridSize}, 1fr)`
          }}
        >
          {Array.from({ length: config.gridSize }, (_, row) =>
            Array.from({ length: config.gridSize }, (_, col) => renderCell(row, col))
          )}
        </div>
      </div>
      
      {gameState.phase === 'roundScore' && (
        <div className="round-score">
          <h3>Round {gameState.currentRound} Score: {gameState.roundScore}</h3>
          <p>Correct tiles: {gameState.correctTiles.size} × 250 = {gameState.correctTiles.size * 250}</p>
          {gameState.roundScore > gameState.correctTiles.size * 250 && (
            <p>Flawless bonus: +100</p>
          )}
        </div>
      )}
      
      <div className="game-instructions">
        {gameState.phase === 'stimulus' && (
          <p>Memorize the highlighted pattern...</p>
        )}
        {gameState.phase === 'recall' && (
          <p>Click the tiles you remember being highlighted. Use arrow keys to navigate and Enter to select.</p>
        )}
        {gameState.phase === 'feedback' && (
          <p>Green = correct, Red = incorrect, Gray = missed</p>
        )}
      </div>
    </div>
  );
};

export default MemoryPage; 