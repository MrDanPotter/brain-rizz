import { SudokuGameEngine } from '../gameEngine';
import { SudokuConfig } from '../types';

describe('SudokuGameEngine', () => {
  let gameEngine: SudokuGameEngine;
  let mockOnStateChange: jest.Mock;

  beforeEach(() => {
    mockOnStateChange = jest.fn();
    const config: SudokuConfig = {
      difficulty: 'easy',
      autoCheck: true,
      showHints: false
    };
    gameEngine = new SudokuGameEngine(config, mockOnStateChange);
  });

  afterEach(() => {
    gameEngine.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const state = gameEngine.getState();
      
      expect(state.gameState).toBe('config');
      expect(state.timeElapsed).toBe(0);
      expect(state.mistakes).toBe(0);
      expect(state.hintsUsed).toBe(0);
      expect(state.selectedCell).toBeNull();
      expect(state.inputMode).toBe('number');
    });

    it('should initialize with correct configuration', () => {
      const config = gameEngine.getConfig();
      
      expect(config.difficulty).toBe('easy');
      expect(config.autoCheck).toBe(true);
      expect(config.showHints).toBe(false);
    });
  });

  describe('Game Start', () => {
    it('should start a new game successfully', () => {
      gameEngine.startGame();
      
      const state = gameEngine.getState();
      expect(state.gameState).toBe('playing');
      expect(state.board.cells).toHaveLength(9);
      expect(state.board.cells[0]).toHaveLength(9);
    });

    it('should call onStateChange when starting game', () => {
      gameEngine.startGame();
      
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it('should set correct max mistakes based on difficulty', () => {
      gameEngine.startGame();
      
      const state = gameEngine.getState();
      expect(state.maxMistakes).toBe(5); // Easy difficulty
    });
  });

  describe('Game Controls', () => {
    beforeEach(() => {
      gameEngine.startGame();
    });

    it('should pause the game', () => {
      gameEngine.pauseGame();
      
      const state = gameEngine.getState();
      expect(state.gameState).toBe('paused');
    });

    it('should resume the game', () => {
      gameEngine.pauseGame();
      gameEngine.resumeGame();
      
      const state = gameEngine.getState();
      expect(state.gameState).toBe('playing');
    });

    it('should reset the game', () => {
      gameEngine.resetGame();
      
      const state = gameEngine.getState();
      expect(state.gameState).toBe('config');
      expect(state.timeElapsed).toBe(0);
      expect(state.mistakes).toBe(0);
    });
  });

  describe('Cell Selection', () => {
    beforeEach(() => {
      gameEngine.startGame();
    });

    it('should select a cell', () => {
      gameEngine.selectCell(0, 0);
      
      const state = gameEngine.getState();
      expect(state.selectedCell).toEqual({ row: 0, col: 0 });
    });

    it('should update cell highlights when selecting', () => {
      gameEngine.selectCell(0, 0);
      
      const state = gameEngine.getState();
      const cell = state.board.cells[0][0];
      expect(cell.isSelected).toBe(true);
      expect(cell.isHighlighted).toBe(true);
    });

    it('should not select cells when game is not playing', () => {
      gameEngine.pauseGame();
      gameEngine.selectCell(0, 0);
      
      const state = gameEngine.getState();
      expect(state.selectedCell).toBeNull();
    });
  });

  describe('Number Input', () => {
    beforeEach(() => {
      gameEngine.startGame();
      // Find an empty cell to select
      const state = gameEngine.getState();
      let emptyRow = -1;
      let emptyCol = -1;
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!state.board.cells[row][col].value) {
            emptyRow = row;
            emptyCol = col;
            break;
          }
        }
        if (emptyRow !== -1) break;
      }
      
      if (emptyRow !== -1) {
        gameEngine.selectCell(emptyRow, emptyCol);
      }
    });

    it('should input a number in number mode', () => {
      const state = gameEngine.getState();
      const selectedCell = state.selectedCell;
      
      if (selectedCell) {
        gameEngine.inputNumber(5);
        
        const newState = gameEngine.getState();
        const cell = newState.board.cells[selectedCell.row][selectedCell.col];
        expect(cell.value).toBe(5);
        expect(cell.notes.size).toBe(0);
      }
    });

    it('should toggle notes in notes mode', () => {
      const state = gameEngine.getState();
      const selectedCell = state.selectedCell;
      
      if (selectedCell) {
        gameEngine.toggleInputMode();
        gameEngine.inputNumber(5);
        
        const newState = gameEngine.getState();
        const cell = newState.board.cells[selectedCell.row][selectedCell.col];
        expect(cell.value).toBeNull();
        expect(cell.notes.has(5)).toBe(true);
      }
    });

    it('should not modify original cells', () => {
      // Find an original cell
      const state = gameEngine.getState();
      let originalCell = null;
      let originalRow = 0;
      let originalCol = 0;
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (state.board.cells[row][col].isOriginal) {
            originalCell = state.board.cells[row][col];
            originalRow = row;
            originalCol = col;
            break;
          }
        }
        if (originalCell) break;
      }
      
      if (originalCell) {
        gameEngine.selectCell(originalRow, originalCol);
        const originalValue = originalCell.value;
        gameEngine.inputNumber(9);
        
        const newState = gameEngine.getState();
        expect(newState.board.cells[originalRow][originalCol].value).toBe(originalValue);
      }
    });

    it('should clear a cell', () => {
      const state = gameEngine.getState();
      const selectedCell = state.selectedCell;
      
      if (selectedCell) {
        gameEngine.inputNumber(5);
        gameEngine.clearCell();
        
        const newState = gameEngine.getState();
        const cell = newState.board.cells[selectedCell.row][selectedCell.col];
        expect(cell.value).toBeNull();
        expect(cell.notes.size).toBe(0);
      }
    });
  });

  describe('Input Mode', () => {
    it('should toggle input mode', () => {
      expect(gameEngine.getState().inputMode).toBe('number');
      
      gameEngine.toggleInputMode();
      expect(gameEngine.getState().inputMode).toBe('notes');
      
      gameEngine.toggleInputMode();
      expect(gameEngine.getState().inputMode).toBe('number');
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      gameEngine.updateConfig({ difficulty: 'hard' });
      
      const config = gameEngine.getConfig();
      expect(config.difficulty).toBe('hard');
    });

    it('should update max mistakes when difficulty changes', () => {
      gameEngine.updateConfig({ difficulty: 'hard' });
      
      const state = gameEngine.getState();
      expect(state.maxMistakes).toBe(1); // Hard difficulty
    });
  });

  describe('Game Statistics', () => {
    beforeEach(() => {
      gameEngine.startGame();
    });

    it('should return correct statistics', () => {
      const stats = gameEngine.getStats();
      
      expect(stats.timeElapsed).toBe(0);
      expect(stats.mistakes).toBe(0);
      expect(stats.hintsUsed).toBe(0);
      expect(stats.difficulty).toBe('easy');
      expect(stats.completed).toBe(false);
    });
  });

  describe('Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should increment time when playing', () => {
      gameEngine.startGame();
      
      jest.advanceTimersByTime(1000);
      
      const state = gameEngine.getState();
      expect(state.timeElapsed).toBe(1);
    });

    it('should not increment time when paused', () => {
      gameEngine.startGame();
      gameEngine.pauseGame();
      
      jest.advanceTimersByTime(1000);
      
      const state = gameEngine.getState();
      expect(state.timeElapsed).toBe(0);
    });
  });
});
