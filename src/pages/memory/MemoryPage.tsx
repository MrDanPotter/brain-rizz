import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MemoryPage.css';
import '../../styles/common.css';

interface GameConfig {
  difficulty: 'easy' | 'medium' | 'hard';
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
    difficulty: 'easy',
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

  // Get grid size and tile count based on difficulty
  const getDifficultyConfig = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return { gridSize: 5, tileCount: 7 };
      case 'medium':
        return { gridSize: 5, tileCount: 10 };
      case 'hard':
        return { gridSize: 6, tileCount: 12 };
      default:
        return { gridSize: 5, tileCount: 7 };
    }
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
      setGameState(prev => {
        const newConsecutiveInactiveRounds = prev.consecutiveInactiveRounds + 1;
        
        if (newConsecutiveInactiveRounds >= 1) {
          return { ...prev, phase: 'sessionEnd' };
        } else {
          return { ...prev, consecutiveInactiveRounds: newConsecutiveInactiveRounds };
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
    // Clear any existing timers
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (stimulusTimerRef.current) {
      window.clearTimeout(stimulusTimerRef.current);
      stimulusTimerRef.current = null;
    }
    
    setGameState(prev => {
      if (prev.phase !== 'recall') return prev;
      
      const correctTiles = new Set<string>();
      const incorrectTiles = new Set<string>();
      
      // Check each selected tile
      prev.selectedTiles.forEach(tileKey => {
        if (prev.highlightedTiles.has(tileKey)) {
          correctTiles.add(tileKey);
        } else {
          incorrectTiles.add(tileKey);
        }
      });
      
      // Calculate score
      const correctCount = correctTiles.size;
      const roundScore = correctCount * 250;
      const flawlessBonus = correctCount === prev.highlightedTiles.size && 
                           prev.selectedTiles.size === prev.highlightedTiles.size ? 100 : 0;
      const totalRoundScore = roundScore + flawlessBonus;
      
      return {
        ...prev,
        phase: 'feedback',
        correctTiles,
        incorrectTiles,
        roundScore: totalRoundScore,
        totalScore: prev.totalScore + totalRoundScore
      };
    });
    
    // Clear any existing feedback timer
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    
    // Show feedback for 1 second
    feedbackTimerRef.current = window.setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        phase: 'roundScore'
      }));
      
      // Show round score for 2 seconds
      window.setTimeout(() => {
        setGameState(prev => {
          if (prev.currentRound >= config.sessionRounds) {
            return { ...prev, phase: 'sessionEnd' };
          } else {
            return {
              ...prev,
              phase: 'stimulus',
              currentRound: prev.currentRound + 1,
              highlightedTiles: new Set(), // Clear old highlighted tiles
              selectedTiles: new Set(),
              correctTiles: new Set(),
              incorrectTiles: new Set()
            };
          }
        });
      }, 2000);
    }, 1000);
  }, [config.sessionRounds]);

  // Start a new round
  const startRound = useCallback(() => {
    // Clear any existing stimulus timer
    if (stimulusTimerRef.current) {
      window.clearTimeout(stimulusTimerRef.current);
      stimulusTimerRef.current = null;
    }
    
    const { gridSize, tileCount } = getDifficultyConfig(config.difficulty);
    const highlightedTiles = generatePattern(gridSize, tileCount);
    
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

    // Clear stimulus after 1 second
    stimulusTimerRef.current = window.setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        phase: 'recall'
      }));
      startInactivityTimer();
    }, 1000);
  }, [config.difficulty, generatePattern, startInactivityTimer, getDifficultyConfig]);

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

  // Handle round transitions - start next round when phase changes to stimulus
  useEffect(() => {
    if (gameState.phase === 'stimulus' && gameState.currentRound > 1) {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        startRound();
      }, 50);
      return () => clearTimeout(timer);
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
            Submit ({gameState.selectedTiles.size}/{getDifficultyConfig(config.difficulty).tileCount})
          </button>
        )}
      </div>
      
      <div className="game-grid-container">
        <div 
          className="game-grid"
          style={{
            gridTemplateColumns: `repeat(${getDifficultyConfig(config.difficulty).gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${getDifficultyConfig(config.difficulty).gridSize}, 1fr)`
          }}
        >
          {Array.from({ length: getDifficultyConfig(config.difficulty).gridSize }, (_, row) =>
            Array.from({ length: getDifficultyConfig(config.difficulty).gridSize }, (_, col) => renderCell(row, col))
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