/**
 * Color utilities for the Stroop Test
 * This file provides functions to work with the current color palette
 * from the ColorPaletteProvider context.
 */

import { ColorPalette, DEFAULT_PALETTE } from './colors/ColorPalettes';

// Type definitions for better type safety
export type ColorWord = string;
export type Color = string;

// Helper function to get colors from a palette
export const getColorsFromPalette = (palette: ColorPalette = DEFAULT_PALETTE) => {
  return {
    COLOR_WORDS: palette.colorWords,
    COLORS: palette.colors,
    COLOR_MAP: palette.colorMap
  };
};

// Helper function to get the accessible color for a given color name
// This function is now palette-agnostic and returns the color as-is
// since accessibility is handled by the palette selection
export const getAccessibleColor = (color: string): string => {
  return color;
};

// Helper function to check if a color word matches its color
export const isColorWordMatching = (word: ColorWord, color: Color, palette: ColorPalette = DEFAULT_PALETTE): boolean => {
  return palette.colorMap[word] === color;
};

