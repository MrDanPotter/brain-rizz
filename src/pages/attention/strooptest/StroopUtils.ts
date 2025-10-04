import { COLOR_WORDS, COLORS, COLOR_MAP } from './StroopColors';

export interface StroopWord {
  text: string;
  color: string;
}

export interface StroopRound {
  words: StroopWord[];
}

/**
 * Generates all rounds for a Stroop test with specified parameters
 * @param numRounds - Total number of rounds to generate
 * @param wordsPerRound - Number of words in each round
 * @param probabilityMatch - Probability (0-100) that each individual word will be congruent (word matches color)
 * @returns Array of StroopRound objects containing all the test data
 */
export function generateStroopRounds(
  numRounds: number,
  wordsPerRound: number,
  probabilityMatch: number
): StroopRound[] {
  // Validate inputs
  if (numRounds <= 0 || wordsPerRound <= 0) {
    throw new Error('numRounds and wordsPerRound must be positive numbers');
  }
  if (probabilityMatch < 0 || probabilityMatch > 100) {
    throw new Error('probabilityMatch must be between 0 and 100');
  }

  const rounds: StroopRound[] = [];

  for (let roundIndex = 0; roundIndex < numRounds; roundIndex++) {
    const words: StroopWord[] = [];
    const usedCombinations = new Set<string>(); // Track used text-color combinations in this round
    
    // Generate each word individually using probability
    for (let wordIndex = 0; wordIndex < wordsPerRound; wordIndex++) {
      let newWord: StroopWord;
      let attempts = 0;
      const maxAttempts = 100; // Increased to allow more attempts for consecutive round avoidance
      
      do {
        const randomValue = Math.random() * 100; // 0-100
        const shouldMatch = randomValue < probabilityMatch;
        
        if (shouldMatch) {
          // Generate congruent word (text matches color)
          const randomIndex = Math.floor(Math.random() * COLOR_WORDS.length);
          const colorWord = COLOR_WORDS[randomIndex];
          const matchingColor = COLORS[randomIndex];
          
          newWord = {
            text: colorWord,
            color: matchingColor
          };
        } else {
          // Generate incongruent word (text doesn't match color)
          const textIndex = Math.floor(Math.random() * COLOR_WORDS.length);
          let colorIndex = Math.floor(Math.random() * COLORS.length);
          
          // Ensure the color doesn't match the text
          while (colorIndex === textIndex) {
            colorIndex = Math.floor(Math.random() * COLORS.length);
          }
          
          newWord = {
            text: COLOR_WORDS[textIndex],
            color: COLORS[colorIndex]
          };
        }
        
        attempts++;
      } while (
        // Check if this combination was used in this round
        usedCombinations.has(`${newWord.text}-${newWord.color}`) && 
        attempts < maxAttempts
      );
      
      // If we couldn't find a unique combination after max attempts, use the last generated one
      // This prevents infinite loops in edge cases where there aren't enough unique combinations
      const combinationKey = `${newWord.text}-${newWord.color}`;
      usedCombinations.add(combinationKey);
      words.push(newWord);
    }

    // Shuffle the words in this round to randomize order
    shuffleArray(words);

    // Now check for consecutive round conflicts and regenerate if necessary
    if (roundIndex > 0) {
      const previousRoundWords = rounds[roundIndex - 1].words;
      let hasConflict = false;
      
      // Check if any word at the same index matches the previous round
      for (let i = 0; i < Math.min(words.length, previousRoundWords.length); i++) {
        if (words[i].text === previousRoundWords[i].text && 
            words[i].color === previousRoundWords[i].color) {
          hasConflict = true;
          break;
        }
      }
      
      // If there's a conflict, regenerate this round
      if (hasConflict) {
        roundIndex--; // Decrement to regenerate this round
        continue;
      }
    }

    rounds.push({
      words: words
    });
  }

  return rounds;
}

/**
 * Utility function to shuffle an array in place using Fisher-Yates algorithm
 * @param array - Array to shuffle
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


/**
 * Helper function to check if a StroopWord is congruent (text matches color)
 * @param word - StroopWord to check
 * @returns true if the word is congruent
 */
export function isCongruent(word: StroopWord): boolean {
  return COLOR_MAP[word.text as keyof typeof COLOR_MAP] === word.color;
}

/**
 * Helper function to get statistics about generated rounds
 * @param rounds - Array of StroopRound objects
 * @returns Object with statistics about the rounds
 */
export function getStroopRoundsStats(rounds: StroopRound[]): {
  totalRounds: number;
  totalWords: number;
  congruentWords: number;
  incongruentWords: number;
  actualMatchPercentage: number;
  uniqueCombinations: number;
  duplicatesWithinRounds: number;
} {
  const totalRounds = rounds.length;
  let totalWords = 0;
  let congruentWords = 0;
  let duplicatesWithinRounds = 0;
  const allCombinations = new Set<string>();

  rounds.forEach(round => {
    const roundCombinations = new Set<string>();
    
    round.words.forEach(word => {
      totalWords++;
      if (isCongruent(word)) {
        congruentWords++;
      }
      
      const combinationKey = `${word.text}-${word.color}`;
      allCombinations.add(combinationKey);
      
      // Check for duplicates within this round
      if (roundCombinations.has(combinationKey)) {
        duplicatesWithinRounds++;
      } else {
        roundCombinations.add(combinationKey);
      }
    });
  });

  const incongruentWords = totalWords - congruentWords;
  const actualMatchPercentage = totalWords > 0 ? (congruentWords / totalWords) * 100 : 0;

  return {
    totalRounds,
    totalWords,
    congruentWords,
    incongruentWords,
    actualMatchPercentage: Math.round(actualMatchPercentage * 100) / 100, // Round to 2 decimal places
    uniqueCombinations: allCombinations.size,
    duplicatesWithinRounds
  };
}
