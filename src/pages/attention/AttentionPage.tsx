import React, { useState } from 'react';
import './AttentionPage.css';
import '../../styles/common.css';
import Stroop from './strooptest/Stroop';

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

  const calculateGrade = (score: number, total: number): string => {
    if (total === 0) return 'F';
    
    const percentage = Math.round((score / total) * 100);
    
    const grades = [
      { grade: 'S', min_score: 100, max_score: 100 },
      { grade: 'A+', min_score: 97, max_score: 99 },
      { grade: 'A', min_score: 93, max_score: 96 },
      { grade: 'A-', min_score: 90, max_score: 92 },
      { grade: 'B+', min_score: 87, max_score: 89 },
      { grade: 'B', min_score: 83, max_score: 86 },
      { grade: 'B-', min_score: 80, max_score: 82 },
      { grade: 'C+', min_score: 77, max_score: 79 },
      { grade: 'C', min_score: 73, max_score: 76 },
      { grade: 'C-', min_score: 70, max_score: 72 },
      { grade: 'D+', min_score: 67, max_score: 69 },
      { grade: 'D', min_score: 65, max_score: 66 },
      { grade: 'F', min_score: 0, max_score: 64 }
    ];

    for (const gradeInfo of grades) {
      if (percentage >= gradeInfo.min_score && percentage <= gradeInfo.max_score) {
        return gradeInfo.grade;
      }
    }
    
    return 'F'; // Fallback
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
              <li>Total rounds: 12</li>
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
              <span className="stat-label">
                Grade: {calculateGrade(finalStats?.totalPoints || 0, finalStats?.totalPossible || 0)}
              </span>
              <span className="stat-value">
                ({finalStats?.totalPoints || 0}/{finalStats?.totalPossible || 0})
              </span>
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
  return <Stroop onGameEnd={handleGameEnd} startGame={shouldStartGame} wordCount={getDifficultyWordCount(difficulty)} roundTime={getRoundTime(difficulty)} numRounds={12} />;
};

export default AttentionPage;