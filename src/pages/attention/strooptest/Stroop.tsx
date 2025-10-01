import React, { useState, useEffect } from 'react';
import StroopWord from './StroopWord';
import { generateStroopRounds, StroopRound, StroopWord as StroopWordType, isCongruent } from './StroopUtils';

interface GameStats {
  totalPoints: number;
  totalPossible: number;
}

interface StroopProps {
  onGameEnd: (stats: GameStats) => void;
  startGame: boolean;
  wordCount: number;
  roundTime: number; // Time in seconds for each round
  numRounds: number; // Number of rounds in the game
}

const Stroop: React.FC<StroopProps> = ({ onGameEnd, startGame, wordCount, roundTime, numRounds }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<StroopRound[]>([]);
  const [score, setScore] = useState(0);
  const [clickedWords, setClickedWords] = useState<Set<number>>(new Set()); // Track clicked word indices
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isBreather, setIsBreather] = useState(false);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0);

  // Generate rounds when game starts
  useEffect(() => {
    if (startGame && gameState === 'waiting') {
      const generatedRounds = generateStroopRounds(numRounds, wordCount, 40); // Use numRounds prop, 40% probability
      setRounds(generatedRounds);
      setGameState('playing');
      setCurrentRound(0);
      setTimeRemaining(roundTime);
      setClickedWords(new Set());
      // Calculate total possible score (each word can potentially give 1 point)
      setTotalPossibleScore(numRounds * wordCount);
    }
  }, [startGame, gameState, wordCount, roundTime, numRounds]);

  // Timer logic for rounds
  useEffect(() => {
    if (gameState !== 'playing' || isBreather) return;

    if (timeRemaining <= 0) {
      // Round ended - calculate score and move to next round
      calculateRoundScore();
      
      if (currentRound < rounds.length - 1) {
        // Start breather before next round
        setIsBreather(true);
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setTimeRemaining(roundTime);
          setClickedWords(new Set());
          setIsBreather(false);
        }, 500); // 0.5 second breather
      } else {
        // Game finished
        setGameState('finished');
        endGame();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 0.1);
    }, 100);

    return () => clearTimeout(timer);
  }, [timeRemaining, gameState, currentRound, rounds.length, isBreather, roundTime]);

  // Handle word clicks - toggle clicked state
  const handleWordClick = (wordIndex: number) => {
    setClickedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordIndex)) {
        newSet.delete(wordIndex);
      } else {
        newSet.add(wordIndex);
      }
      return newSet;
    });
  };

  // Calculate score for current round
  const calculateRoundScore = () => {
    const currentRoundData = rounds[currentRound];
    if (!currentRoundData) return;

    let roundScore = 0;
    
    currentRoundData.words.forEach((word, index) => {
      const isClicked = clickedWords.has(index);
      const isWordCongruent = isCongruent(word);
      
      // +1 point for correct state:
      // - Congruent word is clicked
      // - Incongruent word is not clicked
      if ((isWordCongruent && isClicked) || (!isWordCongruent && !isClicked)) {
        roundScore += 1;
      }
    });

    setScore(prev => prev + roundScore);
  };

  // Function to end game
  const endGame = () => {
    // Calculate the final score including the current round (since setState is async)
    const currentRoundData = rounds[currentRound];
    let finalScore = score;
    
    if (currentRoundData) {
      // Add the current round's score
      currentRoundData.words.forEach((word, index) => {
        const isClicked = clickedWords.has(index);
        const isWordCongruent = isCongruent(word);
        
        // +1 point for correct state:
        // - Congruent word is clicked
        // - Incongruent word is not clicked
        if ((isWordCongruent && isClicked) || (!isWordCongruent && !isClicked)) {
          finalScore += 1;
        }
      });
    }
    
    const finalStats: GameStats = {
      totalPoints: finalScore,
      totalPossible: totalPossibleScore
    };
    onGameEnd(finalStats);
  };

  if (gameState === 'waiting') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: 'white'
      }}>
        Waiting for game to start...
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: 'white'
      }}>
        Game completed!
      </div>
    );
  }


  // Main game rendering
  const currentRoundData = rounds[currentRound];
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'white' }}>Stroop Test</h2>
        <div style={{ fontSize: '16px', color: 'white', marginBottom: '10px' }}>
          Round {currentRound + 1} of {rounds.length}
        </div>
      </div>

      {currentRoundData && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: wordCount === 6 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '20px',
          minHeight: '200px',
          maxWidth: wordCount === 6 ? '400px' : 'auto',
          margin: '0 auto'
        }}>
          {currentRoundData.words.map((word, index) => (
            <div key={index} style={{
              width: '120px',
              height: '60px',
              margin: '8px',
              justifySelf: 'center'
            }}>
              {!isBreather && (
                <StroopWord
                  value={word.text}
                  color={word.color}
                  clicked={clickedWords.has(index)}
                  onClick={() => handleWordClick(index)}
                />
              )}
            </div>
          ))}
        </div>
      )}


      <div style={{ marginTop: '20px', fontSize: '14px', color: 'white' }}>
        <p><strong>Instructions:</strong> Click on words when the text matches the color!</p>
        <p>• Congruent words (text matches color) = Click them</p>
        <p>• Incongruent words (text doesn't match color) = Don't click them</p>
        <p>Difficulty: {wordCount} word{wordCount > 1 ? 's' : ''} per round</p>
      </div>
    </div>
  );
};

export default Stroop;
