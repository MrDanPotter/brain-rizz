import { BOARD_SIZE, BOX_SIZE, VALID_NUMBERS, TRANSFORMATION_TYPES } from './constants';
import { isValidMove, isValidBoard, hasUniqueSolution, isComplete } from './validators';

/**
 * Generates a valid solved Sudoku board using backtracking algorithm
 */
export function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
  
  function solve(board: number[][]): boolean {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === 0) {
          // Shuffle numbers for randomness
          const shuffledNumbers = [...VALID_NUMBERS].sort(() => Math.random() - 0.5);
          
          for (let num of shuffledNumbers) {
            if (isValidMove(board, row, col, num)) {
              board[row][col] = num;
              
              if (solve(board)) {
                return true;
              }
              
              board[row][col] = 0; // Backtrack
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  solve(board);
  return board;
}

/**
 * Applies valid transformations to a Sudoku board that preserve validity
 */
export function applyValidTransformations(board: number[][], numTransformations: number = 5): number[][] {
  let transformedBoard = board.map(row => [...row]);
  
  for (let i = 0; i < numTransformations; i++) {
    const transformationType = getRandomTransformation();
    transformedBoard = applyTransformation(transformedBoard, transformationType);
  }
  
  return transformedBoard;
}

/**
 * Gets a random valid transformation type
 */
function getRandomTransformation(): string {
  const types = Object.values(TRANSFORMATION_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Applies a specific transformation to the board
 */
function applyTransformation(board: number[][], type: string): number[][] {
  const newBoard = board.map(row => [...row]);
  
  switch (type) {
    case TRANSFORMATION_TYPES.ROW_SWAP:
      return swapRows(newBoard);
    case TRANSFORMATION_TYPES.COLUMN_SWAP:
      return swapColumns(newBoard);
    case TRANSFORMATION_TYPES.NUMBER_RELABEL:
      return relabelNumbers(newBoard);
    case TRANSFORMATION_TYPES.BOX_ROW_SWAP:
      return swapBoxRows(newBoard);
    case TRANSFORMATION_TYPES.BOX_COLUMN_SWAP:
      return swapBoxColumns(newBoard);
    default:
      return newBoard;
  }
}

/**
 * Swaps two random rows within the same 3x3 box
 */
function swapRows(board: number[][]): number[][] {
  const boxRow = Math.floor(Math.random() * BOX_SIZE);
  const row1 = boxRow * BOX_SIZE + Math.floor(Math.random() * BOX_SIZE);
  const row2 = boxRow * BOX_SIZE + Math.floor(Math.random() * BOX_SIZE);
  
  if (row1 !== row2) {
    [board[row1], board[row2]] = [board[row2], board[row1]];
  }
  
  return board;
}

/**
 * Swaps two random columns within the same 3x3 box
 */
function swapColumns(board: number[][]): number[][] {
  const boxCol = Math.floor(Math.random() * BOX_SIZE);
  const col1 = boxCol * BOX_SIZE + Math.floor(Math.random() * BOX_SIZE);
  const col2 = boxCol * BOX_SIZE + Math.floor(Math.random() * BOX_SIZE);
  
  if (col1 !== col2) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      [board[row][col1], board[row][col2]] = [board[row][col2], board[row][col1]];
    }
  }
  
  return board;
}

/**
 * Relabels numbers (1-9 permutation) - preserves Sudoku validity
 */
function relabelNumbers(board: number[][]): number[][] {
  const permutation = [...VALID_NUMBERS].sort(() => Math.random() - 0.5);
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== 0) {
        board[row][col] = permutation[board[row][col] - 1];
      }
    }
  }
  
  return board;
}

/**
 * Swaps two random 3x3 box rows
 */
function swapBoxRows(board: number[][]): number[][] {
  const boxRow1 = Math.floor(Math.random() * BOX_SIZE);
  const boxRow2 = Math.floor(Math.random() * BOX_SIZE);
  
  if (boxRow1 !== boxRow2) {
    for (let i = 0; i < BOX_SIZE; i++) {
      const row1 = boxRow1 * BOX_SIZE + i;
      const row2 = boxRow2 * BOX_SIZE + i;
      [board[row1], board[row2]] = [board[row2], board[row1]];
    }
  }
  
  return board;
}

/**
 * Swaps two random 3x3 box columns
 */
function swapBoxColumns(board: number[][]): number[][] {
  const boxCol1 = Math.floor(Math.random() * BOX_SIZE);
  const boxCol2 = Math.floor(Math.random() * BOX_SIZE);
  
  if (boxCol1 !== boxCol2) {
    for (let i = 0; i < BOX_SIZE; i++) {
      const col1 = boxCol1 * BOX_SIZE + i;
      const col2 = boxCol2 * BOX_SIZE + i;
      for (let row = 0; row < BOARD_SIZE; row++) {
        [board[row][col1], board[row][col2]] = [board[row][col2], board[row][col1]];
      }
    }
  }
  
  return board;
}

/**
 * Generates a random valid Sudoku board with transformations
 */
export function generateRandomSolvedBoard(): number[][] {
  const baseBoard = generateSolvedBoard();
  return applyValidTransformations(baseBoard, 10);
}

/**
 * Validates that a generated board is valid
 */
export function validateGeneratedBoard(board: number[][]): boolean {
  return isValidBoard(board) && isComplete(board);
}
