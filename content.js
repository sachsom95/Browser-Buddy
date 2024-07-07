(function() {
  const cat = document.createElement('div');
  cat.id = 'browser-cat';
  document.body.appendChild(cat);

  let catState = 'idle';
  let lastInteraction = Date.now();
  let currentInterval;

  const spriteWidth = 32;
  const spriteHeight = 32;
  const states = {
    idle: { frames: 16, row: 0, speed: 200 },
    walk: { frames: 8, row: 4, speed: 150 },
    play: { frames: 8, row: 6, speed: 250 }
  };

  cat.style.backgroundImage = `url(${chrome.runtime.getURL('cat-sprite.png')})`;
  cat.style.width = `${spriteWidth}px`;
  cat.style.height = `${spriteHeight}px`;
  cat.style.transform = 'scale(3)';

  function updateSprite(state, frame) {
    const row = Math.floor(frame / 4) + states[state].row;
    const col = frame % 4;
    cat.style.backgroundPosition = `-${col * spriteWidth}px -${row * spriteHeight}px`;
  }

  function animate(state) {
    let frame = 0;
    const frameCount = states[state].frames;
    if (currentInterval) clearInterval(currentInterval);
    currentInterval = setInterval(() => {
      updateSprite(state, frame);
      frame = (frame + 1) % frameCount;
      if (frame === 0 && state !== 'idle') {
        clearInterval(currentInterval);
        animate('idle');
      }
    }, states[state].speed);
  }

  function performAction(action) {
    catState = action;
    animate(action);
    if (action === 'walk') {
      cat.style.animation = 'walk 6s linear';
      setTimeout(() => {
        cat.style.animation = '';
      }, 6000);
    }
  }

  cat.addEventListener('mouseenter', () => {
    if (catState !== 'play') {
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