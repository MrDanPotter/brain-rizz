import React, { useState, useEffect } from 'react';
import StroopWord from './StroopWord';
import { generateStroopRounds, StroopRound, StroopWord as StroopWordType, isCongruent } from './StroopUtils';

interface GameStats {
  totalPoints: number;
  correctGo: number;
  falseAlarms: number;
  omissions: number;
  reactionTimes: number[];
}

interface StroopProps {
  onGameEnd: (stats: GameStats) => void;
  startGame: boolean;
  wordCount: number;
  roundTime: number; // Time in seconds for each round
}

const Stroop: React.FC<StroopProps> = ({ onGameEnd, startGame, wordCount, roundTime }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<StroopRound[]>([]);
  const [score, setScore] = useState(0);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [omissions, setOmissions] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [clickedWords, setClickedWords] = useState<Set<number>>(new Set()); // Track clicked word indices
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isBreather, setIsBreather] = useState(false);

  // Generate rounds when game starts
  useEffect(() => {
    if (startGame && gameState === 'waiting') {
      const generatedRounds = generateStroopRounds(12, wordCount, 40); // 12 rounds, 40% probability
      setRounds(generatedRounds);
      setGameState('playing');
      setCurrentRound(0);
      setTimeRemaining(roundTime);
      setClickedWords(new Set());
    }
  }, [startGame, gameState, wordCount, roundTime]);

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

  // Placeholder function to end game
  const endGame = () => {
    const finalStats: GameStats = {
      totalPoints: score,
      correctGo: correctResponses,
      falseAlarms: falseAlarms,
      omissions: omissions,
      reactionTimes: reactionTimes
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
        Game completed! Final Score: {score}
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
        <div style={{ fontSize: '14px', color: 'white' }}>
          Score: {score}
        </div>
      </div>

      {currentRoundData && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          minHeight: '200px'
        }}>
          {currentRoundData.words.map((word, index) => (
            <div key={index} style={{
              width: '120px',
              height: '60px',
              margin: '8px'
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

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={endGame}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          End Game Early
        </button>
      </div>

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
