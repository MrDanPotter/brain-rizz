import React, { useState } from 'react';
import './AttentionPage.css';
import '../../styles/common.css';
import Stroop from './strooptest/Stroop';
import StroopStartPage from './strooptest/StroopStartPage';
import StroopConclusion from './strooptest/StroopConclusion';

interface GameStats {
  totalPoints: number;
  totalPossible: number;
}

const AttentionPage: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'summary'>('menu');
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const [shouldStartGame, setShouldStartGame] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const getDifficultyWordCount = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
      case 'easy':
        return 3;
      case 'medium':
        return 6;
      case 'hard':
        return 9;
      default:
        return 1;
    }
  };

  const getRoundTime = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
      case 'easy':
        return 3;
      case 'medium':
        return 4;
      case 'hard':
        return 5;
      default:
        return 2;
    }
  };

  const startGame = () => {
    setGameState('playing');
    setShouldStartGame(true);
  };

  const handleGameEnd = (stats: GameStats) => {
    setFinalStats(stats);
    setGameState('summary');
  };

  const playAgain = () => {
    setGameState('menu');
    setFinalStats(null);
    setShouldStartGame(false);
  };



  if (gameState === 'menu') {
    return (
      <StroopStartPage
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onStartGame={startGame}
      />
    );
  }

  if (gameState === 'summary' && finalStats) {
    return (
      <StroopConclusion
        finalStats={finalStats}
        onPlayAgain={playAgain}
      />
    );
  }

  // Render the main Stroop game component
  return <Stroop onGameEnd={handleGameEnd} startGame={shouldStartGame} wordCount={getDifficultyWordCount(difficulty)} roundTime={getRoundTime(difficulty)} numRounds={12} />;
};

export default AttentionPage;