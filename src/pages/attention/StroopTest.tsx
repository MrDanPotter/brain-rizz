import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StroopStimulus {
  word: string;
  inkColor: string;
  isCongruent: boolean;
}

interface StroopTrial {
  stimuli: StroopStimulus[];
  id: string;
}

interface GameStats {
  totalPoints: number;
  correctGo: number;
  falseAlarms: number;
  omissions: number;
  reactionTimes: number[];
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface StroopTestProps {
  onGameEnd: (stats: GameStats) => void;
  startGame: boolean;
  difficulty: Difficulty;
}

const COLORS = ['red', 'blue', 'green', 'yellow'];

const StroopTest: React.FC<StroopTestProps> = ({ onGameEnd, startGame, difficulty }) => {
  const [currentTrial, setCurrentTrial] = useState<StroopTrial | null>(null);
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
  const [lastTrial, setLastTrial] = useState<string>('');
  const [selectedCombinations, setSelectedCombinations] = useState<Set<string>>(new Set());
  const [targetCount, setTargetCount] = useState<number>(0);
  const [clickedWords, setClickedWords] = useState<Set<number>>(new Set());
  
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
    
    return {
      word,
      inkColor: finalInkColor,
      isCongruent: word === finalInkColor
    };
  }, []);

  const generateTrial = useCallback((): StroopTrial => {
    const wordCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 6;
    const stimuli: StroopStimulus[] = [];
    
    // Generate unique stimuli
    const usedCombinations = new Set<string>();
    
    for (let i = 0; i < wordCount; i++) {
      let stimulus: StroopStimulus;
      let attempts = 0;
      
      do {
        stimulus = generateStimulus();
        const combinationKey = `${stimulus.word}-${stimulus.inkColor}`;
        attempts++;
        
        if (attempts > 50) {
          // Fallback to avoid infinite loop
          break;
        }
      } while (usedCombinations.has(`${stimulus.word}-${stimulus.inkColor}`));
      
      const combinationKey = `${stimulus.word}-${stimulus.inkColor}`;
      usedCombinations.add(combinationKey);
      stimuli.push(stimulus);
    }
    
    // Avoid immediate repetition of entire trial
    const trialKey = stimuli.map(s => `${s.word}-${s.inkColor}`).sort().join('|');
    if (trialKey === lastTrial) {
      return generateTrial();
    }
    
    return {
      stimuli,
      id: trialKey
    };
  }, [difficulty, generateStimulus, lastTrial]);

  const showTrial = useCallback(() => {
    const trial = generateTrial();
    setCurrentTrial(trial);
    setLastTrial(trial.id);
    setFeedback('none');
    setClickedWords(new Set());
    canRespondRef.current = true;
    startTimeRef.current = Date.now();
    
    // Clear trial after fixed 2 seconds regardless of user input
    stimulusTimerRef.current = setTimeout(() => {
      // Check for omissions - congruent words that weren't clicked
      trial.stimuli.forEach(stimulus => {
        if (stimulus.isCongruent) {
          setStats(prev => ({
            ...prev,
            omissions: prev.omissions + 1
          }));
        }
      });
      setCurrentTrial(null);
      canRespondRef.current = false;
      
      // Show blank screen for 500ms
      blankTimerRef.current = setTimeout(() => {
        if (gameStateRef.current === 'playing') {
          showTrial();
        }
      }, 500);
    }, 2000);
  }, [generateTrial]);


  const handleWordClick = useCallback((wordIndex: number) => {
    if (!canRespondRef.current || !currentTrial) return;
    
    const reactionTime = Date.now() - startTimeRef.current;
    
    const stimulus = currentTrial.stimuli[wordIndex];
    const combinationKey = `${stimulus.word}-${stimulus.inkColor}`;
    
    if (stimulus.isCongruent) {
      // Check if this word was already clicked in this trial
      if (clickedWords.has(wordIndex)) {
        // Already clicked this word - false alarm
        setScore(prev => prev - 1);
        setStats(prev => ({
          ...prev,
          totalPoints: prev.totalPoints - 1,
          falseAlarms: prev.falseAlarms + 1
        }));
        setFeedback('incorrect');
      } else {
        // For easy mode, just check if it's a new click
        if (difficulty === 'easy') {
          // New correct click
          setScore(prev => prev + 1);
          setStats(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + 1,
            correctGo: prev.correctGo + 1,
            reactionTimes: [...prev.reactionTimes, reactionTime]
          }));
          setClickedWords(prev => new Set([...prev, wordIndex]));
          setFeedback('correct');
          
          // Don't end trial - let it run for full duration
        } else {
          // Check if this combination was already selected in previous trials (medium/hard mode)
          if (selectedCombinations.has(combinationKey)) {
            // Already selected this combination - false alarm
            setScore(prev => prev - 1);
            setStats(prev => ({
              ...prev,
              totalPoints: prev.totalPoints - 1,
              falseAlarms: prev.falseAlarms + 1
            }));
            setFeedback('incorrect');
          } else {
            // New correct combination
            setScore(prev => prev + 1);
            setStats(prev => ({
              ...prev,
              totalPoints: prev.totalPoints + 1,
              correctGo: prev.correctGo + 1,
              reactionTimes: [...prev.reactionTimes, reactionTime]
            }));
            setSelectedCombinations(prev => new Set([...prev, combinationKey]));
            setClickedWords(prev => new Set([...prev, wordIndex]));
            setFeedback('correct');
          }
        }
      }
    } else {
      // False alarm - clicked on incongruent word
      setScore(prev => prev - 1);
      setStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - 1,
        falseAlarms: prev.falseAlarms + 1
      }));
      setFeedback('incorrect');
    }
    
    // For medium/hard mode, don't end trial early - let it run for full duration
    // User clicks just provide feedback and scoring
  }, [currentTrial, selectedCombinations, clickedWords, difficulty]);


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
    setLastTrial('');
    setSelectedCombinations(new Set());
    setClickedWords(new Set());
    
    // Set target count based on difficulty
    const targetCounts = { easy: 0, medium: 3, hard: 6 };
    setTargetCount(targetCounts[difficulty]);
    
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
          
          // Start the first trial
          setTimeout(() => {
            showTrial();
          }, 500);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    gameStateRef.current = 'summary';
    setCurrentTrial(null);
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

  const getAverageReactionTime = () => {
    if (stats.reactionTimes.length === 0) return 0;
    return Math.round(stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length);
  };

  return (
    <div className={`stroop-game ${feedback !== 'none' ? `feedback-${feedback}` : ''}`}>
      <div className="game-header">
        <div className="score-display">Score: {score}</div>
        <div className="time-display">Time: {timeLeft}s</div>
        {(difficulty === 'medium' || difficulty === 'hard') && (
          <div className="progress-display">
            Progress: {selectedCombinations.size}/{targetCount}
          </div>
        )}
      </div>
      
      <div className="game-area">
        {countdown !== null ? (
          <div className="countdown-container">
            <div className="countdown-text">Start in</div>
            <div className="countdown-number">{countdown}</div>
          </div>
        ) : (
          <div className="stimulus-container">
            {currentTrial ? (
              <div className={`words-grid ${difficulty === 'easy' ? 'single-word' : difficulty === 'medium' ? 'three-words' : 'six-words'}`}>
                {currentTrial.stimuli.map((stimulus, index) => (
                  <div
                    key={index}
                    className={`stimulus-word clickable ${clickedWords.has(index) ? 'clicked' : ''}`}
                    onClick={() => handleWordClick(index)}
                    style={{ 
                      color: getColorStyle(stimulus.inkColor)
                    }}
                    aria-label={`Text: ${stimulus.word}, Color: ${stimulus.inkColor}`}
                  >
                    {stimulus.word}
                  </div>
                ))}
              </div>
            ) : (
              <div className="stimulus-word"></div>
            )}
          </div>
        )}
      </div>
      
      <div className="game-instructions">
        {difficulty === 'easy' && (
          <p>Click on the word when it matches its color</p>
        )}
        {(difficulty === 'medium' || difficulty === 'hard') && (
          <>
            <p>Click on the word when it matches its color</p>
            <p>Find {targetCount} different combinations</p>
          </>
        )}
      </div>
    </div>
  );
};

export default StroopTest;
