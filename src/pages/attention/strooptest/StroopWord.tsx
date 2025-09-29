import React, { useState } from 'react';

interface StroopTestWordProps {
  value: string;          // The text value to display
  color: string;          // The text color to render with
  clicked: boolean;       // Whether the word is in clicked state
  onClick: () => void;    // Callback function when clicked
}

const StroopTestWord: React.FC<StroopTestWordProps> = ({ 
  value, 
  color, 
  clicked, 
  onClick 
}) => {
  const handleClick = () => {
    onClick();
  };

  // Make yellow more accessible by using a darker shade
  const getAccessibleColor = (color: string): string => {
    if (color.toLowerCase() === 'yellow') {
      return '#B8860B'; // Dark goldenrod - much more readable on white background
    }
    return color;
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    margin: '8px',
    // Fixed container size to prevent layout shifts
    width: '120px',
    height: '60px',
    position: 'relative',
  };

  const wordStyle: React.CSSProperties = {
    color: getAccessibleColor(color),
    fontSize: '24px',
    fontWeight: 'bold',
    padding: '12px 20px',
    border: clicked ? '3px solid #333' : '2px solid transparent',
    borderRadius: '8px',
    backgroundColor: clicked ? '#e0e0e0' : 'white', // Darker background when selected
    cursor: 'pointer',
    userSelect: 'none',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    left: '0',
    transition: 'all 0.2s ease',
    boxShadow: clicked ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
    transform: clicked ? 'scale(0.95)' : 'scale(1)', // Only the button scales, not the container
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const hoverStyle: React.CSSProperties = {
    ...wordStyle,
    backgroundColor: clicked ? '#d5d5d5' : '#f8f8f8', // Even darker when clicked + hovered
    transform: clicked ? 'scale(0.95)' : 'scale(1.05)',
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={containerStyle}>
      <button
        style={isHovered ? hoverStyle : wordStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Word: ${value}, Color: ${getAccessibleColor(color)}, ${clicked ? 'Selected' : 'Not selected'}`}
      >
        {value}
      </button>
    </div>
  );
};

export default StroopTestWord;
