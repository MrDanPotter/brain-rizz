import {
  generateSolvedBoard,
  generateRandomSolvedBoard,
  applyValidTransformations,
  validateGeneratedBoard
} from '../generator';
import { isValidBoard, isComplete } from '../validators';

describe('Sudoku Generator', () => {
  describe('generateSolvedBoard', () => {
    it('should generate a valid solved board', () => {
      const board = generateSolvedBoard();
      
      expect(board).toHaveLength(9);
      expect(board[0]).toHaveLength(9);
      expect(isValidBoard(board)).toBe(true);
      expect(isComplete(board)).toBe(true);
    });

    it('should generate different boards on multiple calls', () => {
      const board1 = generateSolvedBoard();
      const board2 = generateSolvedBoard();
      
      // Boards should be different (very high probability)
      expect(board1).not.toEqual(board2);
    });

    it('should generate boards with all numbers 1-9', () => {
      const board = generateSolvedBoard();
      const allNumbers = board.reduce((acc, row) => acc.concat(row), []);
      
      for (let i = 1; i <= 9; i++) {
        expect(allNumbers).toContain(i);
      }
    });
  });

  describe('generateRandomSolvedBoard', () => {
    it('should generate a valid solved board with transformations', () => {
      const board = generateRandomSolvedBoard();
      
      expect(board).toHaveLength(9);
      expect(board[0]).toHaveLength(9);
      expect(isValidBoard(board)).toBe(true);
      expect(isComplete(board)).toBe(true);
    });

    it('should generate different boards on multiple calls', () => {
      const board1 = generateRandomSolvedBoard();
      const board2 = generateRandomSolvedBoard();
      
      // Boards should be different (very high probability)
      expect(board1).not.toEqual(board2);
    });
  });

  describe('applyValidTransformations', () => {
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

    it('should preserve board validity after transformations', () => {
      const transformedBoard = applyValidTransformations(baseBoard, 5);
      
      expect(isValidBoard(transformedBoard)).toBe(true);
      expect(isComplete(transformedBoard)).toBe(true);
    });

    it('should produce different boards with different numbers of transformations', () => {
      const board1 = applyValidTransformations(baseBoard, 3);
      const board2 = applyValidTransformations(baseBoard, 7);
      
      expect(board1).not.toEqual(board2);
    });

    it('should handle zero transformations', () => {
      const transformedBoard = applyValidTransformations(baseBoard, 0);
      
      expect(transformedBoard).toEqual(baseBoard);
    });
  });

  describe('validateGeneratedBoard', () => {
    it('should return true for valid complete boards', () => {
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
      
      expect(validateGeneratedBoard(validBoard)).toBe(true);
    });

    it('should return false for invalid boards', () => {
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
      invalidBoard[0][0] = 3; // Create duplicate
      
      expect(validateGeneratedBoard(invalidBoard)).toBe(false);
    });

    it('should return false for incomplete boards', () => {
      const incompleteBoard = [
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
      incompleteBoard[0][0] = 0; // Make incomplete
      
      expect(validateGeneratedBoard(incompleteBoard)).toBe(false);
    });
  });
});
