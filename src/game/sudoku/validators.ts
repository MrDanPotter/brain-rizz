import { BOARD_SIZE, BOX_SIZE, VALID_NUMBERS } from './constants';
import { SudokuCell } from './types';

/**
 * Validates if a number can be placed at the given position
 */
export function isValidMove(
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check if number is in valid range
  if (!VALID_NUMBERS.includes(num)) return false;

  // If the cell already contains this number, it's valid (no change needed)
  if (board[row][col] === num) return true;

  // Check row for conflicts
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column for conflicts
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box for conflicts
  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (board[startRow + i][startCol + j] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates if a complete Sudoku board is valid
 */
export function isValidBoard(board: number[][]): boolean {
  if (!board || board.length !== BOARD_SIZE) return false;

  for (let row = 0; row < BOARD_SIZE; row++) {
    if (!board[row] || board[row].length !== BOARD_SIZE) return false;
  }

  // Check each row, column, and box for duplicates
  for (let i = 0; i < BOARD_SIZE; i++) {
    // Check row i
    const rowNumbers = board[i].filter(num => num !== 0);
    if (new Set(rowNumbers).size !== rowNumbers.length) return false;

    // Check column i
    const colNumbers = board.map(row => row[i]).filter(num => num !== 0);
    if (new Set(colNumbers).size !== colNumbers.length) return false;

    // Check box i
    const boxRow = Math.floor(i / BOX_SIZE) * BOX_SIZE;
    const boxCol = (i % BOX_SIZE) * BOX_SIZE;
    const boxNumbers = [];
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        const num = board[boxRow + r][boxCol + c];
        if (num !== 0) boxNumbers.push(num);
      }
    }
    if (new Set(boxNumbers).size !== boxNumbers.length) return false;
  }

  return true;
}

/**
 * Checks if a board is completely filled
 */
export function isComplete(board: number[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) return false;
    }
  }
  return true;
}

/**
 * Counts the number of solutions for a given board
 */
export function countSolutions(board: number[][], maxSolutions: number = 2): number {
  let solutionCount = 0;
  
  function solve(board: number[][]): boolean {
    if (solutionCount >= maxSolutions) return true;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === 0) {
          for (let num of VALID_NUMBERS) {
            if (isValidMove(board, row, col, num)) {
              board[row][col] = num;
              
              if (solve(board)) {
                return true;
              }
              
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    
    // Board is complete - found a solution
    solutionCount++;
    return solutionCount >= maxSolutions;
  }
  
  const boardCopy = board.map(row => [...row]);
  solve(boardCopy);
  
  return solutionCount;
}

/**
 * Validates if a puzzle has exactly one solution
 */
export function hasUniqueSolution(board: number[][]): boolean {
  return countSolutions(board, 2) === 1;
}

/**
 * Validates if a SudokuCell board is valid
 */
export function isValidCellBoard(cellBoard: SudokuCell[][]): boolean {
  if (!cellBoard || cellBoard.length !== BOARD_SIZE) return false;

  for (let row = 0; row < BOARD_SIZE; row++) {
    if (!cellBoard[row] || cellBoard[row].length !== BOARD_SIZE) return false;
  }

  // Convert to number board for validation
  const numberBoard = cellBoard.map(row => 
    row.map(cell => cell.value || 0)
  );

  return isValidBoard(numberBoard);
}

/**
 * Checks if the game is completed (all cells filled and valid)
 */
export function isGameCompleted(cellBoard: SudokuCell[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = cellBoard[row][col];
      if (!cell.value || cell.isError) {
        return false;
      }
    }
  }
  
  const numberBoard = cellBoard.map(row => 
    row.map(cell => cell.value || 0)
  );
  
  return isValidBoard(numberBoard);
}
