// Main exports for the Sudoku game engine
export { SudokuGameEngine } from './gameEngine';
export { generateSolvedBoard, generateRandomSolvedBoard } from './generator';
export { createPuzzle, createDifficultyBasedPuzzle } from './puzzleCreator';
export { 
  isValidMove, 
  isValidBoard, 
  isComplete, 
  hasUniqueSolution, 
  isGameCompleted 
} from './validators';

// Type exports
export type {
  SudokuCell,
  SudokuBoard,
  SudokuConfig,
  SudokuGameState,
  SudokuStats,
  DifficultyLevel,
  DifficultyConfig
} from './types';

// Constants
export { 
  BOARD_SIZE, 
  BOX_SIZE, 
  DIFFICULTY_CONFIGS, 
  VALID_NUMBERS 
} from './constants';
