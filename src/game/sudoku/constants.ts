import { DifficultyConfig } from './types';

export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;
export const EMPTY_CELL = 0;

export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    cellsToRemove: 30,
    maxMistakes: 5,
    solvingTechniques: ['naked_singles', 'hidden_singles']
  },
  medium: {
    cellsToRemove: 40,
    maxMistakes: 3,
    solvingTechniques: ['naked_singles', 'hidden_singles', 'naked_pairs', 'pointing_pairs']
  },
  hard: {
    cellsToRemove: 50,
    maxMistakes: 1,
    solvingTechniques: ['naked_singles', 'hidden_singles', 'naked_pairs', 'pointing_pairs', 'x_wing', 'swordfish']
  }
};

export const VALID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const TRANSFORMATION_TYPES = {
  ROW_SWAP: 'row_swap',
  COLUMN_SWAP: 'column_swap',
  NUMBER_RELABEL: 'number_relabel',
  BOX_ROW_SWAP: 'box_row_swap',
  BOX_COLUMN_SWAP: 'box_column_swap'
} as const;
