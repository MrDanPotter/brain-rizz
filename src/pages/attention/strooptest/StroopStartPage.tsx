import React from 'react';
import '../../../styles/common.css';
import { useColorPalette } from './colors';

interface StroopStartPageProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onStartGame: () => void;
}

const StroopStartPage: React.FC<StroopStartPageProps> = ({
  difficulty,
  onDifficultyChange,
  onStartGame
}) => {
  const { currentPalette, isColorBlindMode, setColorBlindMode } = useColorPalette();

  return (
    <div className="stroop-page">
      <div className="stroop-menu">
        <div className="menu-card">
          <h2>Stroop Test</h2>
          <p>Click the word only when the word matches its color</p>
          
          <h3>Instructions</h3>
          <ul>
            <li>You'll see color words ({currentPalette.colorWords.join(', ')})</li>
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
                onChange={(e) => onDifficultyChange(e.target.value as 'easy' | 'medium' | 'hard')}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="config-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isColorBlindMode}
                  onChange={(e) => setColorBlindMode(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Enable color-blind mode
              </label>
            </div>
          </div>
          
          <button className="start-btn" onClick={onStartGame}>
            Begin
          </button>
        </div>
      </div>
    </div>
  );
};

export default StroopStartPage;
