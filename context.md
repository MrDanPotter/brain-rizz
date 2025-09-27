# Brain Rizz Development Context

## Project Overview
Brain Rizz is a cognitive training web application with three main games: Memory, Attention (Stroop Test), and Problem-Solving. The app was built with React/TypeScript and deployed as a PWA.

## Major Changes Made

### 1. Memory Game Improvements
- **Removed display time option**: Fixed stimulus time at 1 second
- **Simplified difficulty levels**: 
  - Easy: 5×5 grid, 7 spaces to select
  - Medium: 5×5 grid, 10 spaces to select  
  - Hard: 6×6 grid, 12 spaces to select
- **Fixed scoring bug**: Resolved issue where scores were always showing as 0
- **Fixed timing issues**: Eliminated race conditions and multiple timer conflicts

### 2. Navigation System Overhaul
- **Removed React Router**: Switched to state-based navigation to avoid Netlify routing issues
- **Single URL approach**: All navigation happens via component state, keeping URL unchanged
- **Commented out Attention tab**: Temporarily disabled, then re-enabled later

### 3. Attention Game (Stroop Test) Enhancements
- **Added difficulty selection menu**: Easy, Medium, Hard options
- **Multiple words display**: 
  - Easy: 1 word at a time (original behavior)
  - Medium: 3 words simultaneously in a row
  - Hard: 6 words simultaneously in a 3×2 grid
- **Click-based interaction**: Medium/Hard modes require clicking on words that match their color
- **Progress tracking**: Shows how many different combinations have been found
- **Enhanced scoring**: Prevents duplicate selections, tracks false alarms and omissions
- **Removed color blind mode**: Deleted StroopTestShapes.tsx to simplify codebase

### 4. Technical Improvements
- **Timer management**: Proper cleanup and prevention of overlapping timers
- **State management**: Used functional state updates to prevent stale closures
- **UI/UX enhancements**: Added hover effects, visual feedback, and responsive design
- **Code cleanup**: Removed unused components and simplified architecture

## Current State
- Memory game: Fully functional with 3 difficulty levels
- Attention game: Fully functional with multiple words display for medium/hard modes
- Problem-solving game: Available but not modified
- All games use state-based navigation (no routing)
- PWA functionality maintained
- Deployed and working on Netlify

## Key Technical Decisions
- State-based navigation over React Router for deployment compatibility
- Multiple words display for increased cognitive load in attention game
- Fixed timing system to prevent race conditions
- Simplified difficulty progression with clear visual feedback
