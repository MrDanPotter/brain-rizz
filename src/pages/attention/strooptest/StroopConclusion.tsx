import React from 'react';
import '../../../styles/common.css';

interface GameStats {
  totalPoints: number;
  totalPossible: number;
}

interface StroopConclusionProps {
  finalStats: GameStats;
  onPlayAgain: () => void;
}

const StroopConclusion: React.FC<StroopConclusionProps> = ({
  finalStats,
  onPlayAgain
}) => {
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
              Grade: {calculateGrade(finalStats.totalPoints, finalStats.totalPossible)}
            </span>
            <span className="stat-value">
              ({finalStats.totalPoints}/{finalStats.totalPossible})
            </span>
          </div>
        </div>
        
        <button className="play-again-btn" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default StroopConclusion;
