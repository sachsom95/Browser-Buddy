# Animated Cat Companion

A delightful Chrome extension that brings a cute, interactive pixel art cat to your browsing experience.

![Cat Companion Demo](cat-companion-demo.gif)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [For Developers](#for-developers)
  - [Technical Stack](#technical-stack)
  - [Project Structure](#project-structure)
  - [Key Components](#key-components)
  - [Code Architecture](#code-architecture)
  - [How It Works](#how-it-works)
  - [Customization](#customization)
  - [Future Development](#future-development)

## Features

- 🐱 Adorable pixel art cat animation
- 🎮 Interactive behaviors: idle, play, and walk
- 🔄 Randomized idle animations to keep things interesting
- 📱 Responsive design that works on any website
- 🎨 Customizable appearance (coming soon!)

## Installation

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Click "Add to Chrome"
3. Confirm the installation when prompted

Your new feline friend will appear immediately on all web pages!

## Usage

- **Mouse over** the cat to see it react and play
- **Click** on the cat to make it walk around
- Simply enjoy its presence as you browse – it will occasionally perform random actions when idle

## For Developers

### Technical Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (ES6+)
- CSS3 with animations

### Project Structure

```
animated-cat-companion/
├── manifest.json
├── content.js
├── styles.css
├── cat-sprite.png
├── cat.png
└── README.md
```

### Key Components

1. `manifest.json`: Defines the extension structure and permissions
2. `content.js`: Contains the main logic for the cat's behavior and animations
3. `styles.css`: Handles the visual styling and animations of the cat element
4. `cat-sprite.png`: The sprite sheet containing all cat animations
5. `cat.png`: The extension icon

### Code Architecture

The extension uses the revealing module pattern to encapsulate the cat's functionality:

```javascript
const CatCompanion = (function() {
  // Private variables and functions
  
  return {
    // Public API
    init: function() {
      // Initialization code
    }
  };
})();
```

This structure allows for easy expansion and maintenance of the codebase.

### How It Works

The cat's animation is achieved using a technique called sprite animation. Here's how it works:

1. **Sprite Sheet**: A single image (`cat-sprite.png`) contains multiple frames of the cat's animation.

2. **Displaying a Frame**: The cat is displayed using a div element with the sprite sheet as its background image. The div's size is set to match one frame of the animation.

3. **Background Position**: The key to the animation is changing the `background-position` CSS property. This determines which part of the sprite sheet is visible.

4. **Animation Process**:
   - We start with `background-position: 0px 0px`, showing the first frame.
   - To show the second frame, we set `background-position: -32px 0px` (assuming each frame is 32px wide).
   - This process continues for each frame of the animation.

5. **Rapid Changes**: In the code, these background position changes happen quickly (e.g., every 200ms), creating the illusion of smooth movement.

6. **Looping**: When we reach the last frame, we loop back to the first frame for continuous animation.

This technique is efficient because it requires only one image to be loaded, and the animation is handled entirely by CSS and JavaScript.

### Customization

Developers can easily customize the cat's appearance and behavior by modifying the following:

- `STATES` object in `content.js` to adjust animation speeds and frames
- `cat-sprite.png` to change the cat's appearance (ensure to update `SPRITE_WIDTH` and `SPRITE_HEIGHT` if changed)
- CSS variables (coming soon) for easy color scheme adjustments

### Future Development

1. Implement user settings for customization
2. Add more interactive elements and mini-games
3. Develop a system for "feeding" and "caring" for the cat
4. Create additional animal companions

---

Enjoy your new digital feline friend! 🐱💻