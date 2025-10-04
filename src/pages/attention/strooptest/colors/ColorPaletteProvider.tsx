import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorPalette, DEFAULT_PALETTE, ACCESSIBLE_PALETTE } from './ColorPalettes';

interface ColorPaletteContextType {
  currentPalette: ColorPalette;
  isColorBlindMode: boolean;
  setColorBlindMode: (enabled: boolean) => void;
}

const ColorPaletteContext = createContext<ColorPaletteContextType | undefined>(undefined);

interface ColorPaletteProviderProps {
  children: ReactNode;
  initialColorBlindMode?: boolean;
}

export const ColorPaletteProvider: React.FC<ColorPaletteProviderProps> = ({
  children,
  initialColorBlindMode = false
}) => {
  const [isColorBlindMode, setIsColorBlindMode] = useState<boolean>(initialColorBlindMode);

  const currentPalette = isColorBlindMode ? ACCESSIBLE_PALETTE : DEFAULT_PALETTE;

  const setColorBlindMode = (enabled: boolean) => {
    setIsColorBlindMode(enabled);
  };

  const value: ColorPaletteContextType = {
    currentPalette,
    isColorBlindMode,
    setColorBlindMode
  };

  return (
    <ColorPaletteContext.Provider value={value}>
      {children}
    </ColorPaletteContext.Provider>
  );
};

// Custom hook to use the color palette context
export const useColorPalette = (): ColorPaletteContextType => {
  const context = useContext(ColorPaletteContext);
  if (context === undefined) {
    throw new Error('useColorPalette must be used within a ColorPaletteProvider');
  }
  return context;
};

// Helper hook to get current palette colors
export const useCurrentPalette = (): ColorPalette => {
  const { currentPalette } = useColorPalette();
  return currentPalette;
};
