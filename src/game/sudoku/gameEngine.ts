import { 
  SudokuGameState, 
  SudokuConfig, 
  SudokuCell, 
  SudokuBoard, 
  DifficultyLevel,
  SudokuStats 
} from './types';
import { DIFFICULTY_CONFIGS } from './constants';
import { generateRandomSolvedBoard } from './generator';
import { createPuzzle } from './puzzleCreator';
import { isValidMove, isGameCompleted } from './validators';

export class SudokuGameEngine {
  private state: SudokuGameState;
  private config: SudokuConfig;
  private timerId: number | null = null;
  private onStateChange?: (state: SudokuGameState) => void;

  constructor(config: SudokuConfig, onStateChange?: (state: SudokuGameState) => void) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.state = this.createInitialState();
  }

  /**
   * Creates the initial game state
   */
  private createInitialState(): SudokuGameState {
    return {
      board: {
        cells: Array(9).fill(null).map(() => 
          Array(9).fill(null).map(() => ({
            value: null,
            isOriginal: false,
            isSelected: false,
            isHighlighted: false,
            isError: false,
            notes: new Set<number>()
          }))
        )
      },
      selectedCell: null,
      gameState: 'config',
      timeElapsed: 0,
      mistakes: 0,
      hintsUsed: 0,
      maxMistakes: DIFFICULTY_CONFIGS[this.config.difficulty].maxMistakes,
      inputMode: 'number'
    };
  }

  /**
   * Starts a new game
   */
  public startGame(): void {
    try {
      const solvedBoard = generateRandomSolvedBoard();
      const puzzle = createPuzzle(solvedBoard, this.config.difficulty);
      
      this.state = {
        ...this.state,
        board: { cells: puzzle },
        selectedCell: null,
        gameState: 'playing',
        timeElapsed: 0,
        mistakes: 0,
        hintsUsed: 0,
        maxMistakes: DIFFICULTY_CONFIGS[this.config.difficulty].maxMistakes
      };
      
      this.startTimer();
      this.notifyStateChange();
    } catch (error) {
      console.error('Failed to start game:', error);
      throw new Error('Failed to generate a valid Sudoku puzzle');
    }
  }

  /**
   * Pauses the game
   */
  public pauseGame(): void {
    if (this.state.gameState === 'playing') {
      this.state.gameState = 'paused';
      this.stopTimer();
      this.notifyStateChange();
    }
  }

  /**
   * Resumes the game
   */
  public resumeGame(): void {
    if (this.state.gameState === 'paused') {
      this.state.gameState = 'playing';
      this.startTimer();
      this.notifyStateChange();
    }
  }

  /**
   * Resets the game to configuration state
   */
  public resetGame(): void {
    this.stopTimer();
    this.state = this.createInitialState();
    this.notifyStateChange();
  }

  /**
   * Updates the game configuration
   */
  public updateConfig(newConfig: Partial<SudokuConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.state.maxMistakes = DIFFICULTY_CONFIGS[this.config.difficulty].maxMistakes;
    this.notifyStateChange();
  }

  /**
   * Handles cell selection
   */
  public selectCell(row: number, col: number): void {
    if (this.state.gameState !== 'playing') return;

    this.state.selectedCell = { row, col };
    this.updateCellHighlights(row, col);
    this.notifyStateChange();
  }

  /**
   * Handles number input
   */
  public inputNumber(num: number): void {
    if (!this.state.selectedCell || this.state.gameState !== 'playing') return;

    const { row, col } = this.state.selectedCell;
    const cell = this.state.board.cells[row][col];

    if (cell.isOriginal) return; // Can't modify original numbers

    if (this.state.inputMode === 'number') {
      this.inputNumberValue(row, col, num);
    } else {
      this.toggleNote(row, col, num);
    }
  }

  /**
   * Inputs a number value
   */
  private inputNumberValue(row: number, col: number, num: number): void {
    const cell = this.state.board.cells[row][col];
    
    // Check if the move is valid
    const numberBoard = this.state.board.cells.map(r => 
      r.map(c => c.value || 0)
    );
    
    const isValid = isValidMove(numberBoard, row, col, num);
    
    // Update the cell
    this.state.board.cells[row][col] = {
      ...cell,
      value: num,
      notes: new Set(),
      isError: !isValid && this.config.autoCheck
    };

    // Increment mistakes if invalid
    if (!isValid && this.config.autoCheck) {
      this.state.mistakes++;
      
      if (this.state.mistakes >= this.state.maxMistakes) {
        this.state.gameState = 'failed';
        this.stopTimer();
      }
    }

    // Check if game is completed
    if (isGameCompleted(this.state.board.cells)) {
      this.state.gameState = 'completed';
      this.stopTimer();
    }

    this.notifyStateChange();
  }

  /**
   * Toggles a note
   */
  private toggleNote(row: number, col: number, num: number): void {
    const cell = this.state.board.cells[row][col];
    const newNotes = new Set(cell.notes);
    
    if (newNotes.has(num)) {
      newNotes.delete(num);
    } else {
      newNotes.add(num);
    }
    
    this.state.board.cells[row][col] = {
      ...cell,
      notes: newNotes
    };
    
    this.notifyStateChange();
  }

  /**
   * Clears the selected cell
   */
  public clearCell(): void {
    if (!this.state.selectedCell || this.state.gameState !== 'playing') return;

    const { row, col } = this.state.selectedCell;
    const cell = this.state.board.cells[row][col];

    if (cell.isOriginal) return; // Can't clear original numbers

    this.state.board.cells[row][col] = {
      ...cell,
      value: null,
      notes: new Set(),
      isError: false
    };

    this.notifyStateChange();
  }

  /**
   * Toggles input mode between number and notes
   */
  public toggleInputMode(): void {
    this.state.inputMode = this.state.inputMode === 'number' ? 'notes' : 'number';
    this.notifyStateChange();
  }

  /**
   * Uses a hint
   */
  public useHint(): void {
    if (this.state.gameState !== 'playing' || !this.config.showHints) return;

    // Find an empty cell and fill it with the correct value
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = this.state.board.cells[row][col];
        if (!cell.value && !cell.isOriginal) {
          // This is a simplified hint - in a real implementation,
          // you'd solve the puzzle to find the correct value
          const numberBoard = this.state.board.cells.map(r => 
            r.map(c => c.value || 0)
          );
          
          // Find a valid number for this cell
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(numberBoard, row, col, num)) {
              this.state.board.cells[row][col] = {
                ...cell,
                value: num,
                notes: new Set()
              };
              this.state.hintsUsed++;
              this.notifyStateChange();
              return;
            }
          }
        }
      }
    }
  }

  /**
   * Updates cell highlights based on selection
   */
  private updateCellHighlights(selectedRow: number, selectedCol: number): void {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = this.state.board.cells[row][col];
        const isSelected = row === selectedRow && col === selectedCol;
        const isHighlighted = row === selectedRow || 
                             col === selectedCol || 
                             (Math.floor(row / 3) === Math.floor(selectedRow / 3) && 
                              Math.floor(col / 3) === Math.floor(selectedCol / 3));
        
        this.state.board.cells[row][col] = {
          ...cell,
          isSelected,
          isHighlighted
        };
      }
    }
  }

  /**
   * Starts the game timer
   */
  private startTimer(): void {
    this.stopTimer();
    this.timerId = window.setInterval(() => {
      this.state.timeElapsed++;
      this.notifyStateChange();
    }, 1000);
  }

  /**
   * Stops the game timer
   */
  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Notifies listeners of state changes
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  /**
   * Gets the current game state
   */
  public getState(): SudokuGameState {
    return { ...this.state };
  }

  /**
   * Gets the current configuration
   */
  public getConfig(): SudokuConfig {
    return { ...this.config };
  }

  /**
   * Gets game statistics
   */
  public getStats(): SudokuStats {
    return {
      timeElapsed: this.state.timeElapsed,
      mistakes: this.state.mistakes,
      hintsUsed: this.state.hintsUsed,
      difficulty: this.config.difficulty,
      completed: this.state.gameState === 'completed'
    };
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    this.stopTimer();
  }
}
