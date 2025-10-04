import { 
  generateStroopRounds, 
  getStroopRoundsStats, 
  isCongruent
} from '../StroopUtils';
import { DEFAULT_PALETTE } from '../colors/ColorPalettes';

describe('StroopUtils', () => {
  describe('generateStroopRounds', () => {
    it('should generate the correct number of rounds', () => {
      const rounds = generateStroopRounds(5, 3, 50);
      expect(rounds).toHaveLength(5);
    });

    it('should generate the correct number of words per round', () => {
      const rounds = generateStroopRounds(3, 4, 50);
      rounds.forEach(round => {
        expect(round.words).toHaveLength(4);
      });
    });

    it('should not have duplicate word/color combinations within a round', () => {
      const rounds = generateStroopRounds(10, 3, 50);
      rounds.forEach(round => {
        const combinations = round.words.map(word => `${word.text}-${word.color}`);
        const uniqueCombinations = new Set(combinations);
        expect(uniqueCombinations.size).toBe(combinations.length);
      });
    });

    it('should respect the probability of congruent words', () => {
      const rounds = generateStroopRounds(10, 4, 100); // 100% congruent
      rounds.forEach(round => {
        round.words.forEach(word => {
          expect(isCongruent(word)).toBe(true);
        });
      });
    });

    it('should generate only incongruent words when probability is 0', () => {
      const rounds = generateStroopRounds(5, 3, 0); // 0% congruent
      rounds.forEach(round => {
        round.words.forEach(word => {
          expect(isCongruent(word)).toBe(false);
        });
      });
    });

    it('should not have consecutive rounds with same word/color combo at same index', () => {
      const rounds = generateStroopRounds(10, 3, 50);
      
      for (let i = 1; i < rounds.length; i++) {
        const currentRound = rounds[i];
        const previousRound = rounds[i - 1];
        
        // Check each position for conflicts
        for (let j = 0; j < Math.min(currentRound.words.length, previousRound.words.length); j++) {
          const currentWord = currentRound.words[j];
          const previousWord = previousRound.words[j];
          
          // Should not have same text AND color at same index
          expect(
            currentWord.text === previousWord.text && currentWord.color === previousWord.color
          ).toBe(false);
        }
      }
    });

    it('should handle single word rounds without consecutive conflicts', () => {
      const rounds = generateStroopRounds(5, 1, 50);
      
      for (let i = 1; i < rounds.length; i++) {
        const currentWord = rounds[i].words[0];
        const previousWord = rounds[i - 1].words[0];
        
        expect(
          currentWord.text === previousWord.text && currentWord.color === previousWord.color
        ).toBe(false);
      }
    });

    it('should handle different word counts per round', () => {
      // Test with 6 words (hard mode)
      const hardRounds = generateStroopRounds(3, 6, 50);
      hardRounds.forEach(round => {
        expect(round.words).toHaveLength(6);
      });

      // Test consecutive round conflicts for hard mode
      for (let i = 1; i < hardRounds.length; i++) {
        const currentRound = hardRounds[i];
        const previousRound = hardRounds[i - 1];
        
        for (let j = 0; j < 6; j++) {
          const currentWord = currentRound.words[j];
          const previousWord = previousRound.words[j];
          
          expect(
            currentWord.text === previousWord.text && currentWord.color === previousWord.color
          ).toBe(false);
        }
      }
    });

    it('should validate input parameters', () => {
      expect(() => generateStroopRounds(0, 3, 50)).toThrow('numRounds and wordsPerRound must be positive numbers');
      expect(() => generateStroopRounds(3, 0, 50)).toThrow('numRounds and wordsPerRound must be positive numbers');
      expect(() => generateStroopRounds(3, 3, -1)).toThrow('probabilityMatch must be between 0 and 100');
      expect(() => generateStroopRounds(3, 3, 101)).toThrow('probabilityMatch must be between 0 and 100');
    });
  });

  describe('isCongruent', () => {
    it('should correctly identify congruent words', () => {
      expect(isCongruent({ text: 'RED', color: DEFAULT_PALETTE.colorMap.RED })).toBe(true);
      expect(isCongruent({ text: 'BLUE', color: DEFAULT_PALETTE.colorMap.BLUE })).toBe(true);
      expect(isCongruent({ text: 'GREEN', color: DEFAULT_PALETTE.colorMap.GREEN })).toBe(true);
      expect(isCongruent({ text: 'YELLOW', color: DEFAULT_PALETTE.colorMap.YELLOW })).toBe(true);
    });

    it('should correctly identify incongruent words', () => {
      expect(isCongruent({ text: 'RED', color: DEFAULT_PALETTE.colorMap.BLUE })).toBe(false);
      expect(isCongruent({ text: 'BLUE', color: DEFAULT_PALETTE.colorMap.RED })).toBe(false);
      expect(isCongruent({ text: 'GREEN', color: DEFAULT_PALETTE.colorMap.YELLOW })).toBe(false);
      expect(isCongruent({ text: 'YELLOW', color: DEFAULT_PALETTE.colorMap.GREEN })).toBe(false);
    });
  });


  describe('getStroopRoundsStats', () => {
    it('should calculate correct statistics', () => {
      const rounds = generateStroopRounds(3, 2, 50);
      const stats = getStroopRoundsStats(rounds);
      
      expect(stats.totalRounds).toBe(3);
      expect(stats.totalWords).toBe(6); // 3 rounds * 2 words
      expect(stats.actualMatchPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.actualMatchPercentage).toBeLessThanOrEqual(100);
      expect(stats.duplicatesWithinRounds).toBe(0); // Should be 0 due to our generation logic
    });
  });
});
