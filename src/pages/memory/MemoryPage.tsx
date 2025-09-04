import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MemoryPage.css';
import '../../styles/common.css';

interface GameConfig {
  gridSize: number;
  difficulty: 'easy' | 'medium' | 'hard';
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
    gridSize: 6,
    difficulty: 'easy',
    stimulusTime: 1000, // 1 second in milliseconds
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

  // Calculate tile count based on difficulty and grid size
  const getTileCountForDifficulty = useCallback((gridSize: number, difficulty: 'easy' | 'medium' | 'hard') => {
    const min = gridSize; // N
    const max = gridSize * (gridSize - 1); // N*(N-1)
    const hardMax = gridSize * (gridSize - 2); // N*(N-2)
    
    switch (difficulty) {
      case 'easy':
        return min;
      case 'hard':
        return hardMax;
      case 'medium':
        return Math.floor((min + hardMax) / 2);
      default:
        return min;
    }
  }, []);

  // Calculate valid tile count range based on grid size
  const getTileCountRange = useCallback((gridSize: number) => {
    const min = gridSize;
    const max = gridSize * (gridSize - 1);
    return { min, max };
  }, []);

  // Update grid size
  const handleGridSizeChange = useCallback((newGridSize: number) => {
    setConfig(prev => ({
      ...prev,
      gridSize: newGridSize
    }));
  }, []);

  // Handle display time increments/decrements
  const handleDisplayTimeChange = useCallback((increment: boolean) => {
    setConfig(prev => {
      const currentSeconds = prev.stimulusTime / 1000;
      let newSeconds: number;
      
      if (increment) {
        newSeconds = Math.min(currentSeconds + 0.25, 2.5);
      } else {
        newSeconds = Math.max(currentSeconds - 0.25, 0.5);
      }
      
      return {
        ...prev,
        stimulusTime: Math.round(newSeconds * 1000)
      };
    });
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

  // End session
  const endSession = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'sessionEnd'
    }));
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
      
      // Check if we should end session or submit round
      setGameState(prev => {
        if (prev.consecutiveInactiveRounds >= 1) {
          return { ...prev, phase: 'sessionEnd' };
        } else {
          // Submit round logic will be handled in useEffect
          return prev;
        }
      });
    }, config.inactivityTimeout);
  }, [config.inactivityTimeout]);

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
          // Start next round will be handled in useEffect
        }
      }, 2000);
    }, 1000);
  }, [gameState, config.sessionRounds, endSession]);

  // Start a new round
  const startRound = useCallback(() => {
    const tileCount = getTileCountForDifficulty(config.gridSize, config.difficulty);
    const highlightedTiles = generatePattern(config.gridSize, tileCount);
    
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
  }, [config.gridSize, config.difficulty, config.stimulusTime, generatePattern, startInactivityTimer, getTileCountForDifficulty]);

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

  // Handle inactivity timeout
  useEffect(() => {
    if (gameState.consecutiveInactiveRounds >= 1 && gameState.phase === 'recall') {
      submitRound();
    }
  }, [gameState.consecutiveInactiveRounds, gameState.phase, submitRound]);

  // Handle round transitions
  useEffect(() => {
    if (gameState.phase === 'stimulus' && gameState.currentRound > 1) {
      startRound();
    }
  }, [gameState.phase, gameState.currentRound, startRound]);

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
                onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
              >
                {[4, 5, 6, 7].map(size => (
                  <option key={size} value={size}>{size} × {size}</option>
                ))}
              </select>
            </div>
            
            <div className="config-group">
              <label htmlFor="difficulty">Difficulty:</label>
              <select
                id="difficulty"
                value={config.difficulty}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
                }))}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="config-group">
              <label htmlFor="stimulusTime">Display Time:</label>
              <div className="display-time-container">
                <button
                  className="time-btn minus-btn"
                  onClick={() => handleDisplayTimeChange(false)}
                  aria-label="Decrease display time by 0.25 seconds"
                >
                  −
                </button>
                <div className="time-display">
                  {(config.stimulusTime / 1000).toFixed(2)}s
                </div>
                <button
                  className="time-btn plus-btn"
                  onClick={() => handleDisplayTimeChange(true)}
                  aria-label="Increase display time by 0.25 seconds"
                >
                  +
                </button>
              </div>
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
              <span className="stat-label">Difficulty:</span>
              <span className="stat-value">{config.difficulty}</span>
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
            Submit ({gameState.selectedTiles.size}/{getTileCountForDifficulty(config.gridSize, config.difficulty)})
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