import React, { useState } from 'react';
import './AttentionPage.css';
import '../../styles/common.css';
import StroopTest from './StroopTest';

interface GameStats {
  totalPoints: number;
  correctGo: number;
  falseAlarms: number;
  omissions: number;
  reactionTimes: number[];
}

type Difficulty = 'easy' | 'medium' | 'hard';

const AttentionPage: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'summary'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
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
            
            <div className="difficulty-selection">
              <h3>Select Difficulty</h3>
              <div className="difficulty-options">
                <label className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={difficulty === 'easy'}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  />
                  <span className="difficulty-label">Easy</span>
                  <span className="difficulty-desc">Press SPACE when word matches color</span>
                </label>
                
                <label className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="medium"
                    checked={difficulty === 'medium'}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  />
                  <span className="difficulty-label">Medium</span>
                  <span className="difficulty-desc">Click 3 different words/colors</span>
                </label>
                
                <label className="difficulty-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    checked={difficulty === 'hard'}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  />
                  <span className="difficulty-label">Hard</span>
                  <span className="difficulty-desc">Click 6 different words/colors</span>
                </label>
              </div>
            </div>
            
            <h3>Instructions</h3>
            <ul>
              <li>You'll see color words (RED, BLUE, GREEN, YELLOW)</li>
              {difficulty === 'easy' && (
                <>
                  <li>Press SPACE only when the word matches its ink color</li>
                  <li>Do nothing when the word and color don't match</li>
                </>
              )}
              {(difficulty === 'medium' || difficulty === 'hard') && (
                <>
                  <li>Click on the word itself when it matches its ink color</li>
                  <li>Do nothing when the word and color don't match</li>
                  <li>You need to select {difficulty === 'medium' ? '3' : '6'} different combinations</li>
                </>
              )}
              <li>Each trial lasts up to 2 seconds</li>
              <li>Game duration: 60 seconds</li>
            </ul>
            
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

  // Render the Stroop Test game
  return <StroopTest onGameEnd={handleGameEnd} startGame={shouldStartGame} difficulty={difficulty} />;
};

export default AttentionPage;