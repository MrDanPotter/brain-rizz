import React, { useState } from 'react';
import './AttentionPage.css';
import StroopTest from './StroopTest';
import StroopTestShapes from './StroopTestShapes';

interface GameStats {
  totalPoints: number;
  correctGo: number;
  falseAlarms: number;
  omissions: number;
  reactionTimes: number[];
}

const AttentionPage: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'summary'>('menu');
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const [shouldStartGame, setShouldStartGame] = useState(false);

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
            <p>Press SPACE only when the word matches its color</p>
            
            <h3>Instructions</h3>
            <ul>
              <li>You'll see color words (RED, BLUE, GREEN, YELLOW)</li>
              <li>Press SPACE only when the word matches its ink color</li>
              <li>Do nothing when the word and color don't match</li>
              <li>Each trial lasts up to 2 seconds</li>
              <li>Game duration: 60 seconds</li>
            </ul>
            
            <div className="accessibility-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={colorBlindMode}
                  onChange={(e) => setColorBlindMode(e.target.checked)}
                />
                Color-blind mode (use shapes instead of colors)
              </label>
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

  // Render the appropriate game component based on color-blind mode
  if (colorBlindMode) {
    return <StroopTestShapes onGameEnd={handleGameEnd} startGame={shouldStartGame} />;
  } else {
    return <StroopTest onGameEnd={handleGameEnd} startGame={shouldStartGame} />;
  }
};

export default AttentionPage;