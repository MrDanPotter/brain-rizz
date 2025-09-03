import {
  SudokuGameEngine,
  generateSolvedBoard,
  generateRandomSolvedBoard,
  createPuzzle,
  createDifficultyBasedPuzzle,
  isValidMove,
  isValidBoard,
  isComplete,
  hasUniqueSolution,
  isGameCompleted,
  BOARD_SIZE,
  BOX_SIZE,
  DIFFICULTY_CONFIGS,
  VALID_NUMBERS
} from '../index';

describe('Sudoku Module Exports', () => {
  describe('Constants', () => {
    it('should export correct constants', () => {
      expect(BOARD_SIZE).toBe(9);
      expect(BOX_SIZE).toBe(3);
      expect(VALID_NUMBERS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(DIFFICULTY_CONFIGS).toHaveProperty('easy');
      expect(DIFFICULTY_CONFIGS).toHaveProperty('medium');
      expect(DIFFICULTY_CONFIGS).toHaveProperty('hard');
    });
  });

  describe('Generator Functions', () => {
    it('should export and work with generateSolvedBoard', () => {
      const board = generateSolvedBoard();
      expect(board).toHaveLength(9);
      expect(board[0]).toHaveLength(9);
      expect(isValidBoard(board)).toBe(true);
      expect(isComplete(board)).toBe(true);
    });

    it('should export and work with generateRandomSolvedBoard', () => {
      const board = generateRandomSolvedBoard();
      expect(board).toHaveLength(9);
      expect(board[0]).toHaveLength(9);
      expect(isValidBoard(board)).toBe(true);
      expect(isComplete(board)).toBe(true);
    });
  });

  describe('Puzzle Creator Functions', () => {
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

    it('should export and work with createPuzzle', () => {
      const puzzle = createPuzzle(solvedBoard, 'easy');
      expect(puzzle).toHaveLength(9);
      expect(puzzle[0]).toHaveLength(9);
    });

    it('should export and work with createDifficultyBasedPuzzle', () => {
      const puzzle = createDifficultyBasedPuzzle(solvedBoard, 'medium');
      expect(puzzle).toHaveLength(9);
      expect(puzzle[0]).toHaveLength(9);
    });
  });

  describe('Validator Functions', () => {
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

    it('should export and work with isValidMove', () => {
      expect(isValidMove(validBoard, 0, 0, 5)).toBe(true);
      expect(isValidMove(validBoard, 0, 2, 3)).toBe(false);
    });

    it('should export and work with isValidBoard', () => {
      expect(isValidBoard(validBoard)).toBe(true);
    });

    it('should export and work with isComplete', () => {
      expect(isComplete(validBoard)).toBe(true);
    });

    it('should export and work with hasUniqueSolution', () => {
      const puzzle = validBoard.map(row => [...row]);
      puzzle[0][0] = 0;
      expect(hasUniqueSolution(puzzle)).toBe(true);
    });

    it('should export and work with isGameCompleted', () => {
      const cells = validBoard.map(row =>
        row.map(value => ({
          value,
          isOriginal: true,
          isSelected: false,
          isHighlighted: false,
          isError: false,
          notes: new Set()
        }))
      );
      expect(isGameCompleted(cells)).toBe(true);
    });
  });

  describe('Game Engine', () => {
    it('should export and instantiate SudokuGameEngine', () => {
      const config = {
        difficulty: 'easy' as const,
        autoCheck: true,
        showHints: false
      };
      
      const engine = new SudokuGameEngine(config);
      expect(engine).toBeInstanceOf(SudokuGameEngine);
      engine.destroy();
    });
  });
});
