/**
 * Color palette definitions for the Stroop Test
 * Provides different color schemes for various accessibility needs and preferences
 */

export interface ColorPalette {
  name: string;
  colorWords: readonly string[];
  colors: readonly string[];
  colorMap: Record<string, string>;
}

// Default palette - original colors
export const DEFAULT_PALETTE: ColorPalette = {
  name: 'Default',
  colorWords: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'BLACK'],
  colors: ['red', 'blue', 'green', '#B8860B', 'purple', 'black'],
  colorMap: {
    'RED': 'red',
    'BLUE': 'blue',
    'GREEN': 'green',
    'YELLOW': '#B8860B',
    'PURPLE': 'purple',
    'BLACK': 'black'
  }
};

// Accessible palette - color-blind friendly colors
export const ACCESSIBLE_PALETTE: ColorPalette = {
  name: 'Accessible',
  colorWords: ['BLUE', 'GREEN', 'YELLOW', 'BLACK'],
  colors: ['blue', 'green', '#B8860B', 'black'],
  colorMap: {
    'BLUE': 'blue',
    'GREEN': 'green',
    'YELLOW': '#B8860B',
    'BLACK': 'black'
  }
};

// Helper function to get palette by name
export const getPaletteByName = (name: string): ColorPalette => {
  if (name === 'Accessible') {
    return ACCESSIBLE_PALETTE;
  }
  return DEFAULT_PALETTE;
};

// Helper function to get default palette
export const getDefaultPalette = (): ColorPalette => DEFAULT_PALETTE;

// Helper function to get accessible palette
export const getAccessiblePalette = (): ColorPalette => ACCESSIBLE_PALETTE;
