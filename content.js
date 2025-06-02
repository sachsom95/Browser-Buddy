const CatCompanion = (function() {
  // SPRITE_WIDTH and SPRITE_HEIGHT are the dimensions of each individual frame in the sprite sheet. This will be used to calculate the background position of the sprite. Basically like a convolutional window
  const SPRITE_WIDTH = 32;
  const SPRITE_HEIGHT = 32;
  /*
  Frames: The number of individual images (or frames) in the animation sequence for a particular state
  Example: For the 'idle' state, there are 16 frames, meaning the animation consists of 16 slightly different images that,
            when played in sequence, create   the illusion of movement.
  Row:  The vertical position of the animation sequence in the sprite sheet.
  Example : The 'walkRight' state is on row 4, meaning it's the 5th row in the sprite sheet (remember, rows are zero-indexed).
  Speed: The speed at which the animation should play. This is the time in milliseconds between each frame.
*/
  const STATES = {
    idle: { frames: 16, row: 0, columns: 4, speed: 200 },
    walkRight: { frames: 8, row: 4, columns: 8, speed: 100 },
    walkLeft: { frames: 8, row: 4, columns: 8, speed: 100 },
    runRight: { frames: 8, row: 5, columns: 8, speed: 200 },
    runLeft: { frames: 8, row: 5, columns: 8, speed: 200 },
    sleep: { frames: 4, row: 6, columns: 4, speed: 200 },
    play: { frames: 6, row: 7, columns: 6, speed: 250 },
    pounce: { frames: 7, row: 8, columns: 7, speed: 200 },
    growl: { frames: 8, row: 9, columns: 8, speed: 200 }
  };

  const WALK_SPEED = 0.5;
  const EDGE_PADDING = 20;
  const CAT_SCALE = 3;
  const CLICK_TIMEOUT = 500;
  const PLAY_DURATION = 3000;

  let cat, catState, currentAnimationFrame;
  let isWalking = false;
  let direction = 1;
  let lastFrameTime = 0;
  let currentPosition = { x: EDGE_PADDING, y: EDGE_PADDING };
  let clickCount = 0;
  let lastClickTime = 0;
  let playTimeout;
  let randomWalkInterval;
  let edgeCheckInterval;
  let isInitialized = false;
  let isDestroyed = false;

  function createCatElement() {
    const element = document.createElement('div');
    element.id = 'browser-cat';
    document.body.appendChild(element);
    return element;
  }

  function initializeCat() {
    try {
      const spriteUrl = chrome.runtime.getURL('cat-sprite.png');
      cat.style.backgroundImage = `url(${spriteUrl})`;
      cat.style.width = `${SPRITE_WIDTH}px`;
      cat.style.height = `${SPRITE_HEIGHT}px`;
      cat.style.position = 'fixed';
      cat.style.left = `${currentPosition.x}px`;
      cat.style.bottom = `${currentPosition.y}px`;
      cat.style.zIndex = '9999';
      cat.style.imageRendering = 'pixelated';
      cat.style.pointerEvents = 'auto';
      updateTransform();
      catState = 'idle';
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize cat:', error);
    }
  }

  function updateSprite(state, frame) {
    if (isDestroyed || !cat || !STATES[state]) return;

    const stateConfig = STATES[state];
    const col = frame % stateConfig.columns;
    const row = stateConfig.row + Math.floor(frame / stateConfig.columns);

    const x = col * SPRITE_WIDTH;
    const y = row * SPRITE_HEIGHT;

    cat.style.backgroundPosition = `-${x}px -${y}px`;
  }

  function animate(state) {
    if (isDestroyed || !STATES[state]) return;

    if (currentAnimationFrame) {
      cancelAnimationFrame(currentAnimationFrame);
      currentAnimationFrame = null;
    }

    let frame = 0;
    let lastTime = 0;

    function animateFrame(time) {
      if (isDestroyed) return;

      if (time - lastTime > STATES[state].speed) {
        updateSprite(state, frame);
        frame = (frame + 1) % STATES[state].frames;
        lastTime = time;
      }

      if (catState === state && !isDestroyed) {
        currentAnimationFrame = requestAnimationFrame(animateFrame);
      }
    }

    currentAnimationFrame = requestAnimationFrame(animateFrame);
  }

  function handleMouseEnter() {
    if (!isWalking) {
      startPlaying();
    }
  }

  function handleMouseLeave() {
    if (!isWalking) {
      stopPlaying();
    }
  }

  function walk(timestamp) {
    if (isDestroyed || !isWalking) return;

    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    const frameRate = deltaTime > 0 ? deltaTime : 16.67;
    currentPosition.x += direction * WALK_SPEED * (frameRate / 16.67);

    const maxX = window.innerWidth - (SPRITE_WIDTH * CAT_SCALE) - EDGE_PADDING;

    if (currentPosition.x <= EDGE_PADDING) {
      currentPosition.x = EDGE_PADDING;
      direction = 1;
      updateTransform();
    } else if (currentPosition.x >= maxX) {
      currentPosition.x = maxX;
      direction = -1;
      updateTransform();
    }

    cat.style.left = `${currentPosition.x}px`;

    if (isWalking && !isDestroyed) {
      requestAnimationFrame(walk);
    } else if (!isDestroyed) {
      catState = 'idle';
      animate('idle');
    }
  }

  function startWalking() {
    if (!isWalking && !isDestroyed) {
      isWalking = true;
      catState = direction === 1 ? 'walkRight' : 'walkLeft';
      animate(catState);
      lastFrameTime = 0;
      requestAnimationFrame(walk);
    }
  }

  function stopWalking() {
    isWalking = false;
    lastFrameTime = 0;
    if (edgeCheckInterval) {
      clearInterval(edgeCheckInterval);
      edgeCheckInterval = null;
    }
  }

  function startPlaying() {
    if (isDestroyed) return;

    catState = 'play';
    animate('play');

    if (playTimeout) {
      clearTimeout(playTimeout);
    }

    playTimeout = setTimeout(() => {
      if (!isWalking && !isDestroyed) {
        catState = 'idle';
        animate('idle');
      }
    }, PLAY_DURATION);
  }

  function stopPlaying() {
    if (playTimeout) {
      clearTimeout(playTimeout);
      playTimeout = null;
    }

    if (!isWalking && !isDestroyed) {
      catState = 'idle';
      animate('idle');
    }
  }

  function walkAway() {
    if (isDestroyed) return;

    const screenCenter = window.innerWidth / 2;
    direction = (currentPosition.x < screenCenter) ? -1 : 1;
    updateTransform();

    startWalking();

    if (edgeCheckInterval) {
      clearInterval(edgeCheckInterval);
    }

    edgeCheckInterval = setInterval(() => {
      const maxX = window.innerWidth - (SPRITE_WIDTH * CAT_SCALE) - EDGE_PADDING;
      if (currentPosition.x <= EDGE_PADDING || currentPosition.x >= maxX) {
        stopWalking();
        clearInterval(edgeCheckInterval);
        edgeCheckInterval = null;
      }
    }, 100);
  }

  function handleClick() {
    if (isDestroyed) return;

    const currentTime = Date.now();

    if (currentTime - lastClickTime < CLICK_TIMEOUT) {
      clickCount++;
      if (clickCount >= 3) {
        walkAway();
        clickCount = 0;
      }
    } else {
      clickCount = 1;
      if (!isWalking) {
        startPlaying();
      }
    }

    lastClickTime = currentTime;
  }

  function startRandomWalks() {
    if (randomWalkInterval) {
      clearInterval(randomWalkInterval);
    }

    randomWalkInterval = setInterval(() => {
      if (!isWalking && !isDestroyed && Math.random() < 0.2) {
        startWalking();
        setTimeout(() => {
          if (!isDestroyed) {
            stopWalking();
          }
        }, Math.random() * 3000 + 2000);
      }
    }, 30000);
  }

  function updateTransform() {
    if (cat && !isDestroyed) {
      cat.style.transform = `scale(${CAT_SCALE}) scaleX(${direction})`;
    }
  }

  function cleanup() {
    isDestroyed = true;

    if (currentAnimationFrame) {
      cancelAnimationFrame(currentAnimationFrame);
      currentAnimationFrame = null;
    }

    if (playTimeout) {
      clearTimeout(playTimeout);
      playTimeout = null;
    }

    if (randomWalkInterval) {
      clearInterval(randomWalkInterval);
      randomWalkInterval = null;
    }

    if (edgeCheckInterval) {
      clearInterval(edgeCheckInterval);
      edgeCheckInterval = null;
    }

    if (cat && cat.parentNode) {
      cat.removeEventListener('mouseenter', handleMouseEnter);
      cat.removeEventListener('mouseleave', handleMouseLeave);
      cat.removeEventListener('click', handleClick);
      cat.parentNode.removeChild(cat);
    }
  }

  function init() {
    if (isInitialized) return;

    try {
      cat = createCatElement();
      initializeCat();

      if (isInitialized) {
        animate('idle');
        cat.addEventListener('mouseenter', handleMouseEnter);
        cat.addEventListener('mouseleave', handleMouseLeave);
        cat.addEventListener('click', handleClick);
        startRandomWalks();

        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('unload', cleanup);
      }
    } catch (error) {
      console.error('Failed to initialize Cat Companion:', error);
    }
  }

  return {
    init: init,
    cleanup: cleanup,
    isInitialized: () => isInitialized && !isDestroyed
  };
})();

// Initialize the Cat Companion
CatCompanion.init();