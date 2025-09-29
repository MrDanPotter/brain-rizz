import React, { useState } from 'react';
import './AttentionPage.css';
import '../../styles/common.css';
import Stroop from './strooptest/Stroop';

interface GameStats {
  totalPoints: number;
  correctGo: number;
  falseAlarms: number;
  omissions: number;
  reactionTimes: number[];
}

const AttentionPage: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'summary'>('menu');
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const [shouldStartGame, setShouldStartGame] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const getDifficultyWordCount = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
      case 'easy':
        return 1;
      case 'medium':
        return 3;
      case 'hard':
        return 6;
      default:
        return 1;
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

  const getAverageReactionTime = () => {
    if (!finalStats || finalStats.reactionTimes.length === 0) return 0;
    return Math.round(finalStats.reactionTimes.reduce((a, b) => a + b, 0) / finalStats.reactionTimes.length);
  };

  if (gameState === 'menu') {
    return (
      <div className="stroop-page">
        <div className="stroop-menu">
          <div className="menu-card">
            <h2>Stroop Test</h2>
            <p>Click the word only when the word matches its color</p>
            
            <h3>Instructions</h3>
            <ul>
              <li>You'll see color words (RED, BLUE, GREEN, YELLOW)</li>
              <li>Click the word only when the word matches its ink color</li>
              <li>Do nothing when the word and color don't match</li>
              <li>Each round lasts 2-4 seconds</li>
              <li>Total rounds: 12</li>
              <li>3 Difficulty levels (1, 3, and 6 words)</li>
            </ul>
            
            <div className="config-options">
              <div className="config-group">
                <label htmlFor="difficulty">Difficulty:</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <button className="start-btn" onClick={startGame}>
              Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'summary') {
    return (
      <div className="stroop-page">
        <div className="stroop-header">
          <h2>Game Complete!</h2>
        </div>
        
        <div className="summary-card">
          <h3>Final Results</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-label">Total Points:</span>
              <span className="stat-value">{finalStats?.totalPoints || 0}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Correct Responses:</span>
              <span className="stat-value">{finalStats?.correctGo || 0}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">False Alarms:</span>
              <span className="stat-value">{finalStats?.falseAlarms || 0}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Omissions:</span>
              <span className="stat-value">{finalStats?.omissions || 0}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Average Reaction Time:</span>
              <span className="stat-value">{getAverageReactionTime()}ms</span>
            </div>
          </div>
          
          <button className="play-again-btn" onClick={playAgain}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Render the main Stroop game component
  return <Stroop onGameEnd={handleGameEnd} startGame={shouldStartGame} wordCount={getDifficultyWordCount(difficulty)} />;
};

export default AttentionPage;