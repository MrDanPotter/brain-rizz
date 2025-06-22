import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProblemSolvingPage.css';

interface SudokuConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  autoCheck: boolean;
  showHints: boolean;
}

interface SudokuCell {
  value: number | null;
  isOriginal: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isError: boolean;
  notes: Set<number>;
}

interface SudokuGame {
  board: SudokuCell[][];
  selectedCell: { row: number; col: number } | null;
  gameState: 'config' | 'playing' | 'paused' | 'completed' | 'failed';
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  maxMistakes: number;
}

const ProblemSolvingPage: React.FC = () => {
  const [config, setConfig] = useState<SudokuConfig>({
    difficulty: 'easy',
    autoCheck: true,
    showHints: false
  });

  const [game, setGame] = useState<SudokuGame>({
    board: [],
    selectedCell: null,
    gameState: 'config',
    timeElapsed: 0,
    mistakes: 0,
    hintsUsed: 0,
    maxMistakes: 3
  });

  const timerRef = useRef<number | null>(null);
  const [inputMode, setInputMode] = useState<'number' | 'notes'>('number');

  // Generate a solved Sudoku board
  const generateSolvedBoard = useCallback((): number[][] => {
    // Start with a valid completed Sudoku board
    const baseBoard = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];
    
    // Create a copy and shuffle it to get a different puzzle
    const board = baseBoard.map(row => [...row]);
    
    // Apply some random transformations to make it different
    for (let i = 0; i < 10; i++) {
      const transformation = Math.floor(Math.random() * 4);
      
      switch (transformation) {
        case 0: // Swap two random numbers
          const num1 = Math.floor(Math.random() * 9) + 1;
          const num2 = Math.floor(Math.random() * 9) + 1;
          if (num1 !== num2) {
            for (let row = 0; row < 9; row++) {
              for (let col = 0; col < 9; col++) {
                if (board[row][col] === num1) {
                  board[row][col] = num2;
                } else if (board[row][col] === num2) {
                  board[row][col] = num1;
                }
              }
            }
          }
          break;
        case 1: // Rotate 90 degrees
          const rotated = Array(9).fill(null).map(() => Array(9).fill(0));
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              rotated[col][8 - row] = board[row][col];
            }
          }
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              board[row][col] = rotated[row][col];
            }
          }
          break;
        case 2: // Flip horizontally
          for (let row = 0; row < 9; row++) {
            board[row].reverse();
          }
          break;
        case 3: // Flip vertically
          for (let col = 0; col < 9; col++) {
            for (let row = 0; row < 4; row++) {
              [board[row][col], board[8 - row][col]] = [board[8 - row][col], board[row][col]];
            }
          }
          break;
      }
    }
    
    return board;
  }, []);

  // Check if a move is valid
  const isValidMove = useCallback((board: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }
    
    return true;
  }, []);

  // Create puzzle by removing numbers based on difficulty
  const createPuzzle = useCallback((solvedBoard: number[][], difficulty: string): SudokuCell[][] => {
    const cellsToRemove = {
      easy: 30,
      medium: 40,
      hard: 50,
      expert: 60
    };
    
    const puzzle = solvedBoard.map(row => 
      row.map(value => ({
        value: value as number | null,
        isOriginal: true,
        isSelected: false,
        isHighlighted: false,
        isError: false,
        notes: new Set<number>()
      }))
    );
    
    const positions = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push({ row, col });
      }
    }
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Remove cells
    for (let i = 0; i < cellsToRemove[difficulty as keyof typeof cellsToRemove]; i++) {
      const { row, col } = positions[i];
      puzzle[row][col] = {
        ...puzzle[row][col],
        value: null,
        isOriginal: false
      };
    }
    
    return puzzle;
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    const solvedBoard = generateSolvedBoard();
    const puzzle = createPuzzle(solvedBoard, config.difficulty);
    
    setGame({
      board: puzzle,
      selectedCell: null,
      gameState: 'playing',
      timeElapsed: 0,
      mistakes: 0,
      hintsUsed: 0,
      maxMistakes: config.difficulty === 'easy' ? 5 : config.difficulty === 'medium' ? 3 : 1
    });
    
    // Start timer
    const timerId = window.setInterval(() => {
      setGame(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1
      }));
    }, 1000);
    timerRef.current = timerId;
  }, [config.difficulty, generateSolvedBoard, createPuzzle]);

  // Handle cell selection
  const handleCellClick = useCallback((row: number, col: number) => {
    if (game.gameState !== 'playing') return;
    
    setGame(prev => ({
      ...prev,
      selectedCell: { row, col },
      board: prev.board.map((r, rIndex) =>
        r.map((cell, cIndex) => ({
          ...cell,
          isSelected: rIndex === row && cIndex === col,
          isHighlighted: rIndex === row || cIndex === col || 
                        (Math.floor(rIndex / 3) === Math.floor(row / 3) && 
                         Math.floor(cIndex / 3) === Math.floor(col / 3))
        }))
      )
    }));
  }, [game.gameState]);

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (!game.selectedCell || game.gameState !== 'playing') return;
    
    const { row, col } = game.selectedCell;
    const cell = game.board[row][col];
    
    if (cell.isOriginal) return; // Can't modify original numbers
    
    setGame(prev => {
      const newBoard = [...prev.board];
      const newCell = { ...newBoard[row][col] };
      
      if (inputMode === 'number') {
        // Check if the move is valid
        const isValid = isValidMove(
          newBoard.map(r => r.map(c => c.value || 0)), 
          row, col, num
        );
        
        newCell.value = num;
        newCell.notes.clear();
        newCell.isError = !isValid;
        
        if (!isValid && config.autoCheck) {
          newCell.isError = true;
        }
      } else {
        // Notes mode
        if (newCell.notes.has(num)) {
          newCell.notes.delete(num);
        } else {
          newCell.notes.add(num);
        }
      }
      
      newBoard[row][col] = newCell;
      
      // Check if game is completed
      const isCompleted = newBoard.every(row => 
        row.every(cell => cell.value !== null && !cell.isError)
      );
      
      return {
        ...prev,
        board: newBoard,
        gameState: isCompleted ? 'completed' : prev.gameState
      };
    });
  }, [game.selectedCell, game.gameState, game.board, inputMode, isValidMove, config.autoCheck]);

  // Handle key press
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (game.gameState !== 'playing') return;
    
    if (event.key >= '1' && event.key <= '9') {
      handleNumberInput(parseInt(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      if (game.selectedCell) {
        const { row, col } = game.selectedCell;
        setGame(prev => {
          const newBoard = [...prev.board];
          newBoard[row][col] = {
            ...newBoard[row][col],
            value: null,
            notes: new Set()
          };
          return { ...prev, board: newBoard };
        });
      }
    } else if (event.key === 'n' || event.key === 'N') {
      setInputMode(prev => prev === 'number' ? 'notes' : 'number');
    }
  }, [game.gameState, game.selectedCell, handleNumberInput]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Sudoku cell
  const renderCell = (cell: SudokuCell, row: number, col: number) => {
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
        disabled={game.gameState !== 'playing'}
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

  // Render configuration screen
  if (game.gameState === 'config') {
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
                  difficulty: e.target.value as 'easy' | 'medium' | 'hard' | 'expert' 
                }))}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
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
            
            <div className="config-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.showHints}
                  onChange={(e) => setConfig(prev => ({ ...prev, showHints: e.target.checked }))}
                />
                Show hints
              </label>
            </div>
          </div>
          
          <button className="start-btn" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Render game completion screen
  if (game.gameState === 'completed') {
    return (
      <div className="problem-solving-page">
        <div className="session-end">
          <h2>Puzzle Complete!</h2>
          <div className="final-stats">
            <div className="stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(game.timeElapsed)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Mistakes:</span>
              <span className="stat-value">{game.mistakes}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Hints Used:</span>
              <span className="stat-value">{game.hintsUsed}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Difficulty:</span>
              <span className="stat-value">{config.difficulty}</span>
            </div>
          </div>
          
          <div className="session-actions">
            <button className="play-again-btn" onClick={() => setGame(prev => ({ ...prev, gameState: 'config' }))}>
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
          <span className="time-info">Time: {formatTime(game.timeElapsed)}</span>
          <span className="mistakes-info">Mistakes: {game.mistakes}/{game.maxMistakes}</span>
          <span className="difficulty-info">Difficulty: {config.difficulty}</span>
        </div>
        
        <div className="game-controls">
          <button 
            className={`mode-btn ${inputMode === 'number' ? 'active' : ''}`}
            onClick={() => setInputMode('number')}
          >
            Numbers
          </button>
          <button 
            className={`mode-btn ${inputMode === 'notes' ? 'active' : ''}`}
            onClick={() => setInputMode('notes')}
          >
            Notes
          </button>
        </div>
      </div>
      
      <div className="game-board-container">
        <div className="sudoku-board">
          {game.board.map((row, rowIndex) =>
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
          onClick={() => {
            if (game.selectedCell) {
              const { row, col } = game.selectedCell;
              setGame(prev => {
                const newBoard = [...prev.board];
                newBoard[row][col] = {
                  ...newBoard[row][col],
                  value: null,
                  notes: new Set()
                };
                return { ...prev, board: newBoard };
              });
            }
          }}
        >
          Clear
        </button>
      </div>
      
      <div className="game-instructions">
        <p>Click cells to select them. Use number keys or click the number pad to input values.</p>
        <p>Press 'N' or click the Notes button to toggle between number and notes mode.</p>
        <p>Current mode: <strong>{inputMode === 'number' ? 'Numbers' : 'Notes'}</strong></p>
      </div>
    </div>
  );
};

export default ProblemSolvingPage; 