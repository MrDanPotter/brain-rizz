import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProblemSolvingPage.css';
import '../../styles/common.css';
import { 
  SudokuGameEngine, 
  SudokuConfig, 
  SudokuGameState 
} from '../../game/sudoku';

const ProblemSolvingPage: React.FC = () => {
  const [config, setConfig] = useState<SudokuConfig>({
    difficulty: 'easy',
    autoCheck: true,
    showHints: false
  });

  const [gameState, setGameState] = useState<SudokuGameState | null>(null);
  const gameEngineRef = useRef<SudokuGameEngine | null>(null);

  // Initialize game engine
  useEffect(() => {
    const handleStateChange = (newState: SudokuGameState) => {
      setGameState(newState);
    };

    gameEngineRef.current = new SudokuGameEngine(config, handleStateChange);
    setGameState(gameEngineRef.current.getState());

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  // Update game engine when config changes
  useEffect(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.updateConfig(config);
    }
  }, [config]);

  // Start new game
  const startGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame();
    }
  }, []);

  // Handle cell selection
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.selectCell(row, col);
    }
  }, []);

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.inputNumber(num);
    }
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameState || gameState.gameState !== 'playing') return;
    
    if (event.key >= '1' && event.key <= '9') {
      handleNumberInput(parseInt(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      if (gameEngineRef.current) {
        gameEngineRef.current.clearCell();
      }
    } else if (event.key === 'n' || event.key === 'N') {
      if (gameEngineRef.current) {
        gameEngineRef.current.toggleInputMode();
      }
    }
  }, [gameState, handleNumberInput]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Sudoku cell
  const renderCell = (cell: any, row: number, col: number) => {
    if (!gameState) return null;
    
    let className = 'sudoku-cell';
    
    if (cell.isSelected) className += ' selected';
    if (cell.isHighlighted) className += ' highlighted';
    if (cell.isOriginal) className += ' original';
    if (cell.isError) className += ' error';
    
    return (
      <button
        key={`${row}-${col}`}
        className={className}
        onClick={() => handleCellClick(row, col)}
        disabled={gameState.gameState !== 'playing'}
      >
        {cell.value ? (
          <span className="cell-value">{cell.value}</span>
        ) : cell.notes.size > 0 ? (
          <div className="cell-notes">
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className={`note ${cell.notes.has(i + 1) ? 'visible' : ''}`}
              >
                {cell.notes.has(i + 1) ? i + 1 : ''}
              </span>
            ))}
          </div>
        ) : null}
      </button>
    );
  };

  // Early return if no game state
  if (!gameState) {
    return <div className="problem-solving-page">Loading...</div>;
  }

  // Render configuration screen
  if (gameState.gameState === 'config') {
    return (
      <div className="problem-solving-page">
        <div className="game-config">
          <h2>Sudoku Game</h2>
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
            
            <div className="config-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.autoCheck}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoCheck: e.target.checked }))}
                />
                Auto-check errors
              </label>
            </div>
            
            {/* <div className="config-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.showHints}
                  onChange={(e) => setConfig(prev => ({ ...prev, showHints: e.target.checked }))}
                />
                Show hints
              </label>
            </div> */}
          </div>
          
          <button className="start-btn" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Render game completion screen
  if (gameState.gameState === 'completed') {
    return (
      <div className="problem-solving-page">
        <div className="session-end">
          <h2>Puzzle Complete!</h2>
          <div className="final-stats">
            <div className="stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(gameState.timeElapsed)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Mistakes:</span>
              <span className="stat-value">{gameState.mistakes}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Hints Used:</span>
              <span className="stat-value">{gameState.hintsUsed}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Difficulty:</span>
              <span className="stat-value">{config.difficulty}</span>
            </div>
          </div>
          
          <div className="session-actions">
            <button className="play-again-btn" onClick={() => gameEngineRef.current?.resetGame()}>
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render game board
  return (
    <div className="problem-solving-page">
      <div className="game-header">
        <div className="game-info">
          <span className="time-info">Time: {formatTime(gameState.timeElapsed)}</span>
          <span className="mistakes-info">Mistakes: {gameState.mistakes}/{gameState.maxMistakes}</span>
          <span className="difficulty-info">Difficulty: {config.difficulty}</span>
        </div>
        
        <div className="game-controls">
          <button 
            className={`mode-btn ${gameState.inputMode === 'number' ? 'active' : ''}`}
            onClick={() => gameEngineRef.current?.toggleInputMode()}
          >
            Numbers
          </button>
          <button 
            className={`mode-btn ${gameState.inputMode === 'notes' ? 'active' : ''}`}
            onClick={() => gameEngineRef.current?.toggleInputMode()}
          >
            Notes
          </button>
        </div>
      </div>
      
      <div className="game-board-container">
        <div className="sudoku-board">
          {gameState.board.cells.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
          )}
        </div>
      </div>
      
      <div className="number-pad">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i + 1}
            className="number-btn"
            onClick={() => handleNumberInput(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="number-btn clear-btn"
          onClick={() => gameEngineRef.current?.clearCell()}
        >
          Clear
        </button>
      </div>
      
      <div className="game-instructions">
        <p>Click cells to select them. Use number keys or click the number pad to input values.</p>
        <p>Press 'N' or click the Notes button to toggle between number and notes mode.</p>
        <p>Current mode: <strong>{gameState.inputMode === 'number' ? 'Numbers' : 'Notes'}</strong></p>
      </div>
    </div>
  );
};

export default ProblemSolvingPage; 