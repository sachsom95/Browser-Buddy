(function() {
  const cat = document.createElement('div');
  cat.id = 'browser-cat';
  document.body.appendChild(cat);

  let catState = 'idle';
  let lastInteraction = Date.now();

  const spriteWidth = 32; // Each sprite seems to be 32x32 pixels
  const spriteHeight = 32;
  const states = {
    idle: { frames: 16, row: 0 }, // Using first 4 rows for idle
    walk: { frames: 8, row: 4 },  // Using rows 5-6 for walking
    play: { frames: 8, row: 6 }   // Using last 2 rows for playing
  };

  cat.style.backgroundImage = `url(${chrome.runtime.getURL('cat-sprite.png')})`;
  cat.style.width = `${spriteWidth}px`;
  cat.style.height = `${spriteHeight}px`;
  cat.style.transform = 'scale(3)'; // Make the cat 3 times bigger

  function updateSprite(state, frame) {
    const row = Math.floor(frame / 4) + states[state].row;
    const col = frame % 4;
    cat.style.backgroundPosition = `-${col * spriteWidth}px -${row * spriteHeight}px`;
  }

  function animate(state) {
    let frame = 0;
    const frameCount = states[state].frames;
    const interval = setInterval(() => {
      updateSprite(state, frame);
      frame = (frame + 1) % frameCount;
      if (frame === 0 && state !== 'idle') {
        clearInterval(interval);
        animate('idle');
      }
    }, 150); // Slightly slower animation for better visibility
  }

  function performAction(action) {
    catState = action;
    animate(action);
    if (action === 'walk') {
      cat.style.animation = 'walk 4s linear';
    }
    setTimeout(() => {
      cat.style.animation = '';
    }, action === 'walk' ? 4000 : 0);
  }

  cat.addEventListener('mouseenter', () => {
    if (catState === 'idle') {
      performAction('play');
      lastInteraction = Date.now();
    }
  });

  cat.addEventListener('mouseleave', () => {
    if (catState === 'play') {
      performAction('idle');
    }
  });

  cat.addEventListener('click', () => {
    performAction('walk');
    lastInteraction = Date.now();
  });

  setInterval(() => {
    const now = Date.now();
    if (now - lastInteraction > 10000 && catState === 'idle') {
      if (Math.random() < 0.3) {
        performAction('walk');
      }
    }
  }, 1000);

  animate('idle');
})();