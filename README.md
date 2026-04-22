# Memory-Flip-Game

## Description
MemoryFlip is a browser-based memory matching game where players flip over cards to find matching pairs. Each card hides a symbol, and the player must remember the positions of previously revealed cards to clear the board successfully.

When two flipped cards match, they remain visible. If they do not match, they flip back after a short delay. The goal is to match every pair using the fewest possible moves.

## Features
- Improved interface with clearer layout, status panels, and instructions
- New Game button to reshuffle and restart instantly
- Show Hint button that briefly reveals unmatched cards
- Optional timer challenge toggle
- New difficulty selector with Easy, Medium, and Hard board sizes
- Move counter, match counter, best-score tracking, and live difficulty display

## How to Run
1. Open the project folder.
2. Locate the `index.html` file.
3. Double-click `index.html`, or open it manually in a modern web browser.
4. Choose a difficulty level if you want to change the board size.
5. Press `New Game` and start matching pairs.

## Requirements
- Any modern web browser
- No frameworks
- No external dependencies
- No installation or build step required

## File Structure
- `index.html` - main structure and visible game interface
- `styles.css` - visual styling, layout, and responsive design
- `script.js` - game logic, difficulty handling, card matching behavior, and interactivity
- `README.md` - project summary and usage instructions
