import React from 'react';
import './AttentionPage.css';

const AttentionPage: React.FC = () => {
  return (
    <div className="attention-page">
      <div className="attention-header">
        <h2>Attention Training</h2>
        <p>Enhance your focus and concentration skills</p>
      </div>
      
      <div className="attention-content">
        <div className="attention-section">
          <h3>Focus Exercises</h3>
          <div className="exercise-grid">
            <div className="exercise-card">
              <h4>Spot the Difference</h4>
              <p>Find subtle differences between similar images</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Concentration Timer</h4>
              <p>Maintain focus for extended periods</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Visual Tracking</h4>
              <p>Follow moving objects with your eyes</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
          </div>
        </div>
        
        <div className="attention-section">
          <h3>Distraction Management</h3>
          <div className="exercise-grid">
            <div className="exercise-card">
              <h4>Noise Filtering</h4>
              <p>Focus on specific sounds while ignoring others</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
            
            <div className="exercise-card">
              <h4>Multi-Task Challenge</h4>
              <p>Practice switching between different tasks</p>
              <button className="exercise-btn">Start Exercise</button>
            </div>
          </div>
        </div>
        
        <div className="attention-section">
          <h3>Your Focus Stats</h3>
          <div className="progress-stats">
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Minutes Focused</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0%</span>
              <span className="stat-label">Accuracy Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Sessions Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttentionPage; 