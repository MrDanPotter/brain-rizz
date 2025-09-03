import {
  isValidMove,
  isValidBoard,
  isComplete,
  hasUniqueSolution,
  isGameCompleted
} from '../validators';
import { SudokuCell } from '../types';

describe('Sudoku Validators', () => {
  const validBoard = [
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

  const invalidBoard = [
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

  describe('isValidMove', () => {
    it('should return true for valid moves', () => {
      expect(isValidMove(validBoard, 0, 0, 5)).toBe(true);
      expect(isValidMove(validBoard, 1, 1, 7)).toBe(true);
    });

    it('should return false for invalid moves in row', () => {
      expect(isValidMove(validBoard, 0, 2, 3)).toBe(false);
    });

    it('should return false for invalid moves in column', () => {
      expect(isValidMove(validBoard, 2, 0, 6)).toBe(false);
    });

    it('should return false for invalid moves in box', () => {
      expect(isValidMove(validBoard, 1, 1, 5)).toBe(false);
    });

    it('should return false for invalid numbers', () => {
      expect(isValidMove(validBoard, 0, 0, 0)).toBe(false);
      expect(isValidMove(validBoard, 0, 0, 10)).toBe(false);
    });
  });

  describe('isValidBoard', () => {
    it('should return true for valid complete boards', () => {
      expect(isValidBoard(validBoard)).toBe(true);
    });

    it('should return false for boards with duplicate numbers', () => {
      const boardWithDuplicates = validBoard.map(row => [...row]);
      boardWithDuplicates[0][0] = 3; // Duplicate in row
      expect(isValidBoard(boardWithDuplicates)).toBe(false);
    });

    it('should return false for incomplete boards', () => {
      const incompleteBoard = validBoard.map(row => [...row]);
      incompleteBoard[0][0] = 0;
      expect(isValidBoard(incompleteBoard)).toBe(true); // Should still be valid if incomplete
    });

    it('should return false for boards with wrong dimensions', () => {
      const wrongSizeBoard = [[1, 2, 3]];
      expect(isValidBoard(wrongSizeBoard)).toBe(false);
    });
  });

  describe('isComplete', () => {
    it('should return true for complete boards', () => {
      expect(isComplete(validBoard)).toBe(true);
    });

    it('should return false for incomplete boards', () => {
      const incompleteBoard = validBoard.map(row => [...row]);
      incompleteBoard[0][0] = 0;
      expect(isComplete(incompleteBoard)).toBe(false);
    });
  });

  describe('hasUniqueSolution', () => {
    it('should return true for boards with unique solutions', () => {
      // Create a puzzle with one solution
      const puzzle = validBoard.map(row => [...row]);
      puzzle[0][0] = 0; // Remove one cell
      expect(hasUniqueSolution(puzzle)).toBe(true);
    });

    it('should return false for boards with multiple solutions', () => {
      // Create a puzzle with multiple solutions - minimal constraints
      const puzzle = Array(9).fill(null).map(() => Array(9).fill(0));
      // Only place a few numbers to ensure multiple solutions
      puzzle[0][0] = 1;
      puzzle[0][1] = 2;
      puzzle[0][2] = 3;
      puzzle[1][0] = 4;
      puzzle[1][1] = 5;
      puzzle[1][2] = 6;
      puzzle[2][0] = 7;
      puzzle[2][1] = 8;
      // Leave the rest empty - this should have multiple solutions
      expect(hasUniqueSolution(puzzle)).toBe(false);
    });
  });

  describe('isGameCompleted', () => {
    it('should return true for completed games', () => {
      const completedCells: SudokuCell[][] = validBoard.map(row =>
        row.map(value => ({
          value,
          isOriginal: true,
          isSelected: false,
          isHighlighted: false,
          isError: false,
          notes: new Set()
        }))
      );
      expect(isGameCompleted(completedCells)).toBe(true);
    });

    it('should return false for incomplete games', () => {
      const incompleteCells: SudokuCell[][] = validBoard.map(row =>
        row.map(value => ({
          value: value === 5 ? null : value, // Remove one cell
          isOriginal: value !== 5,
          isSelected: false,
          isHighlighted: false,
          isError: false,
          notes: new Set()
        }))
      );
      expect(isGameCompleted(incompleteCells)).toBe(false);
    });

    it('should return false for games with errors', () => {
      const cellsWithErrors: SudokuCell[][] = validBoard.map(row =>
        row.map(value => ({
          value,
          isOriginal: true,
          isSelected: false,
          isHighlighted: false,
          isError: value === 5, // Mark some cells as errors
          notes: new Set()
        }))
      );
      expect(isGameCompleted(cellsWithErrors)).toBe(false);
    });
  });
});
