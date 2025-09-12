import React, { useState, useEffect, useRef, useCallback } from 'react';

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

interface StroopTestShapesProps {
  onGameEnd: (stats: GameStats) => void;
  startGame: boolean;
}

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SHAPES = ['circle', 'square', 'triangle', 'diamond'];

const StroopTestShapes: React.FC<StroopTestShapesProps> = ({ onGameEnd, startGame }) => {
  const [currentStimulus, setCurrentStimulus] = useState<StroopStimulus | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stats, setStats] = useState<GameStats>({
    totalPoints: 0,
    correctGo: 0,
    falseAlarms: 0,
    omissions: 0,
    reactionTimes: []
  });
  const [lastStimulus, setLastStimulus] = useState<string>('');
  
  const gameTimerRef = useRef<number | null>(null);
  const stimulusTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const blankTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const canRespondRef = useRef<boolean>(false);
  const gameStateRef = useRef<'playing' | 'summary'>('playing');

  // Update gameStateRef whenever gameState changes
  useEffect(() => {
    gameStateRef.current = 'playing';
  }, []);

  // Start game when startGame prop becomes true
  useEffect(() => {
    if (startGame) {
      startGameFunction();
    }
  }, [startGame]);

  const generateStimulus = useCallback((): StroopStimulus => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isCongruent = word === inkColor;
    
    // Ensure 50% chance of congruence
    const shouldBeCongruent = Math.random() < 0.5;
    let finalInkColor = inkColor;
    
    if (shouldBeCongruent !== isCongruent) {
      // Force congruence or incongruence based on the 50% rule
      if (shouldBeCongruent) {
        finalInkColor = word;
      } else {
        // Pick a different color that's not the word
        const otherColors = COLORS.filter(color => color !== word);
        finalInkColor = otherColors[Math.floor(Math.random() * otherColors.length)];
      }
    }
    
    // Avoid immediate repetition
    const stimulusKey = `${word}-${finalInkColor}`;
    if (stimulusKey === lastStimulus) {
      return generateStimulus();
    }
    
    return {
      word,
      inkColor: finalInkColor,
      isCongruent: word === finalInkColor
    };
  }, [lastStimulus]);

  const showStimulus = useCallback(() => {
    const stimulus = generateStimulus();
    setCurrentStimulus(stimulus);
    setLastStimulus(`${stimulus.word}-${stimulus.inkColor}`);
    setFeedback('none');
    canRespondRef.current = true;
    startTimeRef.current = Date.now();
    
    // Clear stimulus after 2 seconds if no response
    stimulusTimerRef.current = setTimeout(() => {
      if (canRespondRef.current) {
        // Omission - failed to press on a match
        if (stimulus.isCongruent) {
          setStats(prev => ({
            ...prev,
            omissions: prev.omissions + 1
          }));
        }
        setCurrentStimulus(null);
        canRespondRef.current = false;
        
        // Show blank screen for 500ms
        blankTimerRef.current = setTimeout(() => {
          if (gameStateRef.current === 'playing') {
            showStimulus();
          }
        }, 500);
      }
    }, 2000);
  }, [generateStimulus]);

  const handleResponse = useCallback(() => {
    if (!canRespondRef.current || !currentStimulus) return;
    
    const reactionTime = Date.now() - startTimeRef.current;
    canRespondRef.current = false;
    
    // Clear the stimulus timer
    if (stimulusTimerRef.current) {
      clearTimeout(stimulusTimerRef.current);
    }
    
    if (currentStimulus.isCongruent) {
      // Correct Go
      setScore(prev => prev + 1);
      setStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + 1,
        correctGo: prev.correctGo + 1,
        reactionTimes: [...prev.reactionTimes, reactionTime]
      }));
      setFeedback('correct');
    } else {
      // False alarm
      setScore(prev => prev - 1);
      setStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - 1,
        falseAlarms: prev.falseAlarms + 1
      }));
      setFeedback('incorrect');
    }
    
    setCurrentStimulus(null);
    
    // Show feedback for 150ms
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('none');
      
      // Show blank screen for 500ms
      blankTimerRef.current = setTimeout(() => {
        if (gameStateRef.current === 'playing') {
          showStimulus();
        }
      }, 500);
    }, 150);
  }, [currentStimulus, showStimulus]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      handleResponse();
    }
  }, [handleResponse]);

  const startGameFunction = () => {
    setScore(0);
    setTimeLeft(60);
    setCountdown(3);
    setStats({
      totalPoints: 0,
      correctGo: 0,
      falseAlarms: 0,
      omissions: 0,
      reactionTimes: []
    });
    setLastStimulus('');
    
    // Start countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          // Countdown finished, start the game
          setCountdown(null);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          
          // Start the game timer
          gameTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                endGame();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          // Start the first stimulus
          setTimeout(() => {
            showStimulus();
          }, 500);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    gameStateRef.current = 'summary';
    setCurrentStimulus(null);
    setCountdown(null);
    canRespondRef.current = false;
    
    // Clear all timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (blankTimerRef.current) clearTimeout(blankTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    // Call the onGameEnd callback with final stats
    onGameEnd(stats);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    return () => {
      // Cleanup timers on unmount
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (blankTimerRef.current) clearTimeout(blankTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const getColorStyle = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: '#e74c3c',
      blue: '#3498db',
      green: '#2ecc71',
      yellow: '#f1c40f'
    };
    return colorMap[color] || color;
  };

  const getShapeStyle = (color: string) => {
    const shapeIndex = COLORS.indexOf(color);
    const shape = SHAPES[shapeIndex];
    
    switch (shape) {
      case 'circle':
        return { borderRadius: '50%' };
      case 'square':
        return { borderRadius: '0' };
      case 'triangle':
        return { 
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          borderRadius: '0'
        };
      case 'diamond':
        return { 
          transform: 'rotate(45deg)',
          borderRadius: '0'
        };
      default:
        return {};
    }
  };

  const getAverageReactionTime = () => {
    if (stats.reactionTimes.length === 0) return 0;
    return Math.round(stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length);
  };

  return (
    <div className={`stroop-game ${feedback !== 'none' ? `feedback-${feedback}` : ''}`}>
      <div className="game-header">
        <div className="score-display">Score: {score}</div>
        <div className="time-display">Time: {timeLeft}s</div>
      </div>
      
      <div className="game-area">
        {countdown !== null ? (
          <div className="countdown-container">
            <div className="countdown-text">Start in</div>
            <div className="countdown-number">{countdown}</div>
          </div>
        ) : (
          <div 
            className="stimulus-container"
            style={{ 
              color: currentStimulus ? getColorStyle(currentStimulus.inkColor) : 'transparent'
            }}
          >
            {currentStimulus && (
              <div 
                className="color-shape"
                style={{
                  backgroundColor: getColorStyle(currentStimulus.inkColor),
                  ...getShapeStyle(currentStimulus.inkColor)
                }}
              />
            )}
            <div 
              className="stimulus-word"
              aria-label={currentStimulus ? `Text: ${currentStimulus.word}, Shape: ${SHAPES[COLORS.indexOf(currentStimulus.inkColor)]}` : 'Waiting for next word'}
            >
              {currentStimulus ? currentStimulus.word : ''}
            </div>
          </div>
        )}
      </div>
      
      <div className="game-controls">
        <button 
          className="response-btn"
          onClick={handleResponse}
          disabled={!canRespondRef.current || countdown !== null}
          aria-label="Press when word matches shape"
        >
          Press when word matches shape
        </button>
      </div>
    </div>
  );
};

export default StroopTestShapes;
