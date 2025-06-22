import React from 'react';
import './ProblemSolvingPage.css';

const ProblemSolvingPage: React.FC = () => {
  return (
    <div className="problem-solving-page">
      <div className="problem-solving-header">
        <h2>Problem Solving Training</h2>
        <p>Develop your logical thinking and analytical skills</p>
      </div>
      
      <div className="problem-solving-content">
        <div className="problem-solving-section">
          <h3>Logic Puzzles</h3>
          <div className="exercise-grid">
            <div className="exercise-card">
              <h4>Sudoku</h4>
              <p>Classic number placement puzzle</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Logic Grid</h4>
              <p>Deductive reasoning puzzles</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Pattern Recognition</h4>
              <p>Identify sequences and patterns</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
          </div>
        </div>
        
        <div className="problem-solving-section">
          <h3>Critical Thinking</h3>
          <div className="exercise-grid">
            <div className="exercise-card">
              <h4>Riddle Master</h4>
              <p>Solve creative thinking puzzles</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Strategy Games</h4>
              <p>Plan and execute winning strategies</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Analytical Reasoning</h4>
              <p>Break down complex problems</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
          </div>
        </div>
        
        <div className="problem-solving-section">
          <h3>Your Problem Solving Stats</h3>
          <div className="progress-stats">
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Puzzles Solved</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Average Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvingPage; 