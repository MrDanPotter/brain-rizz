# Pages Structure

This directory contains the main page components for the Brain Rizz application, organized by cognitive training category.

## Structure

```
src/pages/
├── memory/
│   ├── MemoryPage.tsx      # Main memory training page component
│   ├── MemoryPage.css      # Styles for memory page
│   └── index.ts           # Export file for clean imports
├── attention/
│   ├── AttentionPage.tsx   # Main attention training page component
│   ├── AttentionPage.css   # Styles for attention page
│   └── index.ts           # Export file for clean imports
└── problem-solving/
    ├── ProblemSolvingPage.tsx  # Main problem-solving page component
    ├── ProblemSolvingPage.css  # Styles for problem-solving page
    └── index.ts               # Export file for clean imports
```

## Design Philosophy

Each page follows a consistent structure:
- **Header section** with title and description
- **Exercise grid** showing available training activities
- **Progress stats** displaying user performance metrics
- **Responsive design** that works on mobile and desktop

## Color Themes

- **Memory**: Blue theme (#3498db)
- **Attention**: Red theme (#e74c3c) 
- **Problem-Solving**: Green theme (#27ae60)

## Future Expansion

Each page folder can be expanded to include:
- Individual exercise components
- Game logic and state management
- Additional utility functions
- Test files
- Sub-components for complex features

## Usage

Import pages in your components like this:
```typescript
import MemoryPage from './pages/memory';
import AttentionPage from './pages/attention';
import ProblemSolvingPage from './pages/problem-solving';
``` 