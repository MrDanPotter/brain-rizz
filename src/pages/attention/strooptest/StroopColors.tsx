/**
 * Centralized color definitions for the Stroop Test
 * This file contains all color words and their corresponding color values
 * to ensure consistency across the entire StroopTest codebase.
 */

// Available color words for the Stroop test
export const COLOR_WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'BLACK'] as const;

// Available colors (using accessible colors)
export const COLORS = ['red', 'blue', 'green', '#B8860B', 'purple', 'black'] as const; // Using accessible colors for better readability

// Type definitions for better type safety
export type ColorWord = typeof COLOR_WORDS[number];
export type Color = typeof COLORS[number];

// Mapping from color words to their corresponding colors
export const COLOR_MAP: Record<ColorWord, Color> = {
  'RED': 'red',
  'BLUE': 'blue',
  'GREEN': 'green',
  'YELLOW': '#B8860B',
  'PURPLE': 'purple',
  'BLACK': 'black',
};

// Helper function to get the accessible color for a given color name
export const getAccessibleColor = (color: string): string => {
  const colorLower = color.toLowerCase();
  
  if (colorLower === 'yellow') {
    return '#B8860B'; // Dark goldenrod - much more readable on white background
  }
  if (colorLower === 'pink') {
    return '#C2185B'; // Darker pink for better readability
  }
  if (colorLower === 'orange') {
    return '#FF8F00'; // Darker orange for better contrast
  }
  
  return color;
};

// Helper function to check if a color word matches its color
export const isColorWordMatching = (word: ColorWord, color: Color): boolean => {
  return COLOR_MAP[word] === color;
};

