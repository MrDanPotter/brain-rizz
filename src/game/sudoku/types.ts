export interface SudokuCell {
  value: number | null;
  isOriginal: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isError: boolean;
  notes: Set<number>;
}

export interface SudokuBoard {
  cells: SudokuCell[][];
}

export interface SudokuConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  autoCheck: boolean;
  showHints: boolean;
}

export interface SudokuGameState {
  board: SudokuBoard;
  selectedCell: { row: number; col: number } | null;
  gameState: 'config' | 'playing' | 'paused' | 'completed' | 'failed';
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  maxMistakes: number;
  inputMode: 'number' | 'notes';
}

export interface SudokuStats {
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  difficulty: string;
  completed: boolean;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  cellsToRemove: number;
  maxMistakes: number;
  solvingTechniques: string[];
}
