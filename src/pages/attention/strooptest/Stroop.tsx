import React, { useState, useEffect } from 'react';
import StroopWord from './StroopWord';
import { generateStroopRounds, StroopRound, StroopWord as StroopWordType } from './StroopUtils';

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
}

const Stroop: React.FC<StroopProps> = ({ onGameEnd, startGame, wordCount }) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<StroopRound[]>([]);
  const [score, setScore] = useState(0);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [omissions, setOmissions] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  // Generate rounds when game starts
  useEffect(() => {
    if (startGame && gameState === 'waiting') {
      const generatedRounds = generateStroopRounds(12, wordCount, 40); // 12 rounds, 40% probability
      setRounds(generatedRounds);
      setGameState('playing');
      setCurrentRound(0);
    }
  }, [startGame, gameState, wordCount]);

  // Placeholder function to handle word clicks
  const handleWordClick = (word: StroopWordType) => {
    console.log('Word clicked:', word);
    // TODO: Implement game logic here
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
        color: '#666'
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
        color: '#666'
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
        <h2>Stroop Test</h2>
        <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
          Round {currentRound + 1} of {rounds.length}
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          Score: {score} | Correct: {correctResponses} | Errors: {falseAlarms}
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
            <StroopWord
              key={index}
              value={word.text}
              color={word.color}
              clicked={false} // TODO: Track clicked state per word
              onClick={() => handleWordClick(word)}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => {
            if (currentRound < rounds.length - 1) {
              setCurrentRound(prev => prev + 1);
            } else {
              setGameState('finished');
              endGame();
            }
          }}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {currentRound < rounds.length - 1 ? 'Next Round' : 'Finish Game'}
        </button>

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
          End Game
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Click on words when the text matches the color!</p>
        <p>Difficulty: {wordCount} word{wordCount > 1 ? 's' : ''} per round</p>
      </div>
    </div>
  );
};

export default Stroop;
