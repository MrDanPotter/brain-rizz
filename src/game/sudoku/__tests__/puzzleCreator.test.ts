import {
  createPuzzle,
  createDifficultyBasedPuzzle,
  validatePuzzle,
  analyzePuzzleDifficulty
} from '../puzzleCreator';
import { SudokuCell } from '../types';
import { hasUniqueSolution } from '../validators';

describe('Sudoku Puzzle Creator', () => {
  const solvedBoard = [
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

  describe('createPuzzle', () => {
    it('should create a valid puzzle for easy difficulty', () => {
      const puzzle = createPuzzle(solvedBoard, 'easy');
      
      expect(puzzle).toHaveLength(9);
      expect(puzzle[0]).toHaveLength(9);
      
      // Check that some cells are empty
      const emptyCells = puzzle.reduce((acc, row) => acc + row.filter(cell => !cell.value).length, 0);
      expect(emptyCells).toBeGreaterThan(0);
      
      // Check that puzzle has unique solution
      const numberBoard = puzzle.map(row => row.map(cell => cell.value || 0));
      expect(hasUniqueSolution(numberBoard)).toBe(true);
    });

    it('should create a valid puzzle for medium difficulty', () => {
      const puzzle = createPuzzle(solvedBoard, 'medium');
      
      expect(puzzle).toHaveLength(9);
      expect(puzzle[0]).toHaveLength(9);
      
      // Check that some cells are empty
      const emptyCells = puzzle.reduce((acc, row) => acc + row.filter(cell => !cell.value).length, 0);
      expect(emptyCells).toBeGreaterThan(0);
      
      // Check that puzzle has unique solution
      const numberBoard = puzzle.map(row => row.map(cell => cell.value || 0));
      expect(hasUniqueSolution(numberBoard)).toBe(true);
    });

    it('should create a valid puzzle for hard difficulty', () => {
      const puzzle = createPuzzle(solvedBoard, 'hard');
      
      expect(puzzle).toHaveLength(9);
      expect(puzzle[0]).toHaveLength(9);
      
      // Check that some cells are empty
      const emptyCells = puzzle.reduce((acc, row) => acc + row.filter(cell => !cell.value).length, 0);
      expect(emptyCells).toBeGreaterThan(0);
      
      // Check that puzzle has unique solution
      const numberBoard = puzzle.map(row => row.map(cell => cell.value || 0));
      expect(hasUniqueSolution(numberBoard)).toBe(true);
    });

    it('should create puzzles with different numbers of empty cells by difficulty', () => {
      const easyPuzzle = createPuzzle(solvedBoard, 'easy');
      const mediumPuzzle = createPuzzle(solvedBoard, 'medium');
      const hardPuzzle = createPuzzle(solvedBoard, 'hard');
      
      const easyEmpty = easyPuzzle.reduce((acc, row) => acc + row.filter(cell => !cell.value).length, 0);
      const mediumEmpty = mediumPuzzle.reduce((acc, row) => acc + row.filter(cell => !cell.value).length, 0);
      const hardEmpty = hardPuzzle.reduce((acc, row) => acc + row.filter(cell => !cell.value).length, 0);
      
      expect(easyEmpty).toBeLessThanOrEqual(mediumEmpty);
      expect(mediumEmpty).toBeLessThanOrEqual(hardEmpty);
    });

    it('should mark original cells correctly', () => {
      const puzzle = createPuzzle(solvedBoard, 'easy');
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = puzzle[row][col];
          if (cell.value) {
            expect(cell.isOriginal).toBe(true);
          } else {
            expect(cell.isOriginal).toBe(false);
          }
        }
      }
    });
  });

  describe('createDifficultyBasedPuzzle', () => {
    it('should create puzzles for all difficulty levels', () => {
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      
      difficulties.forEach(difficulty => {
        const puzzle = createDifficultyBasedPuzzle(solvedBoard, difficulty);
        
        expect(puzzle).toHaveLength(9);
        expect(puzzle[0]).toHaveLength(9);
        
        // Check that puzzle has unique solution
        const numberBoard = puzzle.map(row => row.map(cell => cell.value || 0));
        expect(hasUniqueSolution(numberBoard)).toBe(true);
      });
    });
  });

  describe('validatePuzzle', () => {
    it('should return true for valid puzzles', () => {
      const puzzle = createPuzzle(solvedBoard, 'easy');
      expect(validatePuzzle(puzzle)).toBe(true);
    });

    it('should return false for puzzles with multiple solutions', () => {
      // Create a puzzle with multiple solutions - minimal constraints
      const puzzle: SudokuCell[][] = Array(9).fill(null).map(() =>
        Array(9).fill(null).map(() => ({
          value: null,
          isOriginal: false,
          isSelected: false,
          isHighlighted: false,
          isError: false,
          notes: new Set()
        }))
      );
      
      // Add only a few numbers to ensure multiple solutions
      puzzle[0][0] = { ...puzzle[0][0], value: 1, isOriginal: true };
      puzzle[0][1] = { ...puzzle[0][1], value: 2, isOriginal: true };
      puzzle[0][2] = { ...puzzle[0][2], value: 3, isOriginal: true };
      puzzle[1][0] = { ...puzzle[1][0], value: 4, isOriginal: true };
      puzzle[1][1] = { ...puzzle[1][1], value: 5, isOriginal: true };
      puzzle[1][2] = { ...puzzle[1][2], value: 6, isOriginal: true };
      puzzle[2][0] = { ...puzzle[2][0], value: 7, isOriginal: true };
      puzzle[2][1] = { ...puzzle[2][1], value: 8, isOriginal: true };
      // Leave the rest empty - this should have multiple solutions
      
      expect(validatePuzzle(puzzle)).toBe(false);
    });
  });

  describe('analyzePuzzleDifficulty', () => {
    it('should correctly analyze easy puzzles', () => {
      const puzzle = createPuzzle(solvedBoard, 'easy');
      const difficulty = analyzePuzzleDifficulty(puzzle);
      expect(difficulty).toBe('easy');
    });

    it('should correctly analyze medium puzzles', () => {
      const puzzle = createPuzzle(solvedBoard, 'medium');
      const difficulty = analyzePuzzleDifficulty(puzzle);
      expect(difficulty).toBe('medium');
    });

    it('should correctly analyze hard puzzles', () => {
      const puzzle = createPuzzle(solvedBoard, 'hard');
      const difficulty = analyzePuzzleDifficulty(puzzle);
      expect(difficulty).toBe('hard');
    });
  });
});
