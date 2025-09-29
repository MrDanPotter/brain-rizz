import React, { useState, useEffect } from 'react';
import StroopTestWord from './StroopTestWord';

interface StroopStimulus {
  word: string;
  inkColor: string;
  isCongruent: boolean;
}

interface GameStats {
  totalPoints: number;
  correctGo: number;
  falseAlarms: number;
  omissions: number;
  reactionTimes: number[];
}

interface StroopTestProps {
  onGameEnd: (stats: GameStats) => void;
  startGame: boolean;
  wordCount: number;
}

const StroopTest: React.FC<StroopTestProps> = ({ onGameEnd, startGame, wordCount }) => {
  // Game state variables
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(12);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [omissions, setOmissions] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentStimuli, setCurrentStimuli] = useState<StroopStimulus[]>([]);
  
  // Test word states for StroopTestWord components
  const [testWord1Clicked, setTestWord1Clicked] = useState(false);
  const [testWord2Clicked, setTestWord2Clicked] = useState(false);
  const [testWord3Clicked, setTestWord3Clicked] = useState(false);
  const [testWord4Clicked, setTestWord4Clicked] = useState(false);

  // Start the game when startGame prop changes to true
  useEffect(() => {
    if (startGame && gameState === 'waiting') {
      setGameState('playing');
    }
  }, [startGame, gameState]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello World - New Stroop Test</h1>
      
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
        <h2>Internal State Variables:</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><strong>Word Count (from props):</strong> {wordCount}</div>
          <div><strong>Current Round:</strong> {currentRound}</div>
          <div><strong>Total Rounds:</strong> {totalRounds}</div>
          <div><strong>Game State:</strong> {gameState}</div>
          <div><strong>Score:</strong> {score}</div>
          <div><strong>Correct Responses:</strong> {correctResponses}</div>
          <div><strong>False Alarms:</strong> {falseAlarms}</div>
          <div><strong>Omissions:</strong> {omissions}</div>
          <div><strong>Reaction Times Count:</strong> {reactionTimes.length}</div>
          <div><strong>Current Stimuli Count:</strong> {currentStimuli.length}</div>
          <div><strong>Start Game Prop:</strong> {startGame.toString()}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h3>Props Received:</h3>
        <div>
          <div><strong>wordCount:</strong> {wordCount} (determines difficulty - 1=easy, 3=medium, 6=hard)</div>
          <div><strong>startGame:</strong> {startGame.toString()}</div>
          <div><strong>onGameEnd:</strong> {typeof onGameEnd} function</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
        <h3>Current Stimuli Array:</h3>
        {currentStimuli.length > 0 ? (
          <div>
            {currentStimuli.map((stimulus, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>Stimulus {index + 1}:</strong> "{stimulus.word}" in {stimulus.inkColor} color 
                ({stimulus.isCongruent ? 'CONGRUENT' : 'INCONGRUENT'})
              </div>
            ))}
          </div>
        ) : (
          <div>No stimuli generated yet</div>
        )}
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #bbb', padding: '15px', borderRadius: '5px' }}>
        <h3>Test StroopTestWord Components:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <StroopTestWord
            value="RED"
            color="red"
            clicked={testWord1Clicked}
            onClick={() => {
              setTestWord1Clicked(!testWord1Clicked);
              console.log('RED word clicked, new state:', !testWord1Clicked);
            }}
          />
          <StroopTestWord
            value="BLUE"
            color="blue"
            clicked={testWord2Clicked}
            onClick={() => {
              setTestWord2Clicked(!testWord2Clicked);
              console.log('BLUE word clicked, new state:', !testWord2Clicked);
            }}
          />
          <StroopTestWord
            value="GREEN"
            color="yellow"
            clicked={testWord3Clicked}
            onClick={() => {
              setTestWord3Clicked(!testWord3Clicked);
              console.log('GREEN (in yellow) word clicked, new state:', !testWord3Clicked);
            }}
          />
          <StroopTestWord
            value="YELLOW"
            color="green"
            clicked={testWord4Clicked}
            onClick={() => {
              setTestWord4Clicked(!testWord4Clicked);
              console.log('YELLOW (in green) word clicked, new state:', !testWord4Clicked);
            }}
          />
        </div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: 'black' }}>
          Click the words above to test the StroopTestWord component functionality.
          Check browser console for click events.
        </div>
      </div>

      <button 
        onClick={() => {
          console.log('Test button clicked');
          setCurrentRound(prev => prev + 1);
        }}
        style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
      >
        Test: Increment Round
      </button>

      <button 
        onClick={() => {
          const mockStats: GameStats = {
            totalPoints: score,
            correctGo: correctResponses,
            falseAlarms: falseAlarms,
            omissions: omissions,
            reactionTimes: reactionTimes
          };
          onGameEnd(mockStats);
        }}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Test: End Game
      </button>
    </div>
  );
};

export default StroopTest;
