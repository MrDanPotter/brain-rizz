import { BOARD_SIZE, DIFFICULTY_CONFIGS } from './constants';
import { SudokuCell, DifficultyLevel } from './types';
import { hasUniqueSolution, isValidMove } from './validators';

/**
 * Creates a Sudoku puzzle by strategically removing cells from a solved board
 */
export function createPuzzle(
  solvedBoard: number[][],
  difficulty: DifficultyLevel,
  maxAttempts: number = 1000
): SudokuCell[][] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const targetCellsToRemove = config.cellsToRemove;
  
  // Start with all cells filled
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
  
  // Get all possible positions
  const positions = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      positions.push({ row, col });
    }
  }
  
  // Shuffle positions for randomness
  shuffleArray(positions);
  
  let cellsRemoved = 0;
  let attempts = 0;
  
  // Try to remove cells while maintaining unique solution
  for (const position of positions) {
    if (cellsRemoved >= targetCellsToRemove) break;
    if (attempts >= maxAttempts) break;
    
    attempts++;
    
    const { row, col } = position;
    const originalValue = puzzle[row][col].value;
    
    // Temporarily remove the cell
    puzzle[row][col] = {
      ...puzzle[row][col],
      value: null,
      isOriginal: false
    };
    
    // Convert to number board for validation
    const numberBoard = puzzle.map(r => 
      r.map(c => c.value || 0)
    );
    
    // Check if puzzle still has unique solution
    if (hasUniqueSolution(numberBoard)) {
      cellsRemoved++;
    } else {
      // Restore the cell if it breaks uniqueness
      puzzle[row][col] = {
        ...puzzle[row][col],
        value: originalValue,
        isOriginal: true
      };
    }
  }
  
  return puzzle;
}

/**
 * Creates a puzzle with difficulty-based cell removal strategy
 */
export function createDifficultyBasedPuzzle(
  solvedBoard: number[][],
  difficulty: DifficultyLevel
): SudokuCell[][] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // For harder difficulties, use more sophisticated removal strategies
  if (difficulty === 'hard') {
    return createHardPuzzle(solvedBoard, config.cellsToRemove);
  } else if (difficulty === 'medium') {
    return createMediumPuzzle(solvedBoard, config.cellsToRemove);
  } else {
    return createEasyPuzzle(solvedBoard, config.cellsToRemove);
  }
}

/**
 * Creates an easy puzzle by removing cells randomly
 */
function createEasyPuzzle(solvedBoard: number[][], cellsToRemove: number): SudokuCell[][] {
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
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      positions.push({ row, col });
    }
  }
  
  shuffleArray(positions);
  
  // Remove cells randomly
  for (let i = 0; i < Math.min(cellsToRemove, positions.length); i++) {
    const { row, col } = positions[i];
    puzzle[row][col] = {
      ...puzzle[row][col],
      value: null,
      isOriginal: false
    };
  }
  
  return puzzle;
}

/**
 * Creates a medium puzzle with some strategic removal
 */
function createMediumPuzzle(solvedBoard: number[][], cellsToRemove: number): SudokuCell[][] {
  const puzzle = createEasyPuzzle(solvedBoard, cellsToRemove);
  
  // Validate and ensure unique solution
  const numberBoard = puzzle.map(r => r.map(c => c.value || 0));
  
  if (!hasUniqueSolution(numberBoard)) {
    // If not unique, try to fix by adding back some cells
    return createPuzzle(solvedBoard, 'medium');
  }
  
  return puzzle;
}

/**
 * Creates a hard puzzle with strategic cell removal
 */
function createHardPuzzle(solvedBoard: number[][], cellsToRemove: number): SudokuCell[][] {
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
  
  // For hard puzzles, remove cells in a way that requires advanced techniques
  const positions = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      positions.push({ row, col });
    }
  }
  
  // Sort positions by strategic importance (corners and edges first)
  positions.sort((a, b) => {
    const aImportance = getPositionImportance(a.row, a.col);
    const bImportance = getPositionImportance(b.row, b.col);
    return bImportance - aImportance;
  });
  
  let cellsRemoved = 0;
  const maxAttempts = 2000;
  let attempts = 0;
  
  for (const position of positions) {
    if (cellsRemoved >= cellsToRemove) break;
    if (attempts >= maxAttempts) break;
    
    attempts++;
    
    const { row, col } = position;
    const originalValue = puzzle[row][col].value;
    
    // Remove the cell
    puzzle[row][col] = {
      ...puzzle[row][col],
      value: null,
      isOriginal: false
    };
    
    // Check if puzzle still has unique solution
    const numberBoard = puzzle.map(r => r.map(c => c.value || 0));
    
    if (hasUniqueSolution(numberBoard)) {
      cellsRemoved++;
    } else {
      // Restore the cell if it breaks uniqueness
      puzzle[row][col] = {
        ...puzzle[row][col],
        value: originalValue,
        isOriginal: true
      };
    }
  }
  
  return puzzle;
}

/**
 * Calculates the strategic importance of a position for puzzle difficulty
 */
function getPositionImportance(row: number, col: number): number {
  let importance = 0;
  
  // Corners are more important
  if ((row === 0 || row === 8) && (col === 0 || col === 8)) {
    importance += 3;
  }
  
  // Edges are moderately important
  if (row === 0 || row === 8 || col === 0 || col === 8) {
    importance += 2;
  }
  
  // Center positions are less important
  if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
    importance += 1;
  }
  
  // Add some randomness
  importance += Math.random();
  
  return importance;
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Validates that a created puzzle is solvable and has unique solution
 */
export function validatePuzzle(puzzle: SudokuCell[][]): boolean {
  const numberBoard = puzzle.map(r => r.map(c => c.value || 0));
  return hasUniqueSolution(numberBoard);
}

/**
 * Gets the difficulty level of a puzzle based on solving techniques required
 */
export function analyzePuzzleDifficulty(puzzle: SudokuCell[][]): DifficultyLevel {
  const numberBoard = puzzle.map(r => r.map(c => c.value || 0));
  const emptyCells = numberBoard.reduce((acc, row) => acc + row.filter(cell => cell === 0).length, 0);
  
  if (emptyCells <= 30) return 'easy';
  if (emptyCells <= 40) return 'medium';
  return 'hard';
}
