const CatCompanion = (function() {
  const SPRITE_WIDTH = 32;
  const SPRITE_HEIGHT = 32;
  const STATES = {
    idle: { frames: 16, row: 0, speed: 200 },
    play: { frames: 8, row: 6, speed: 250 },
    walkRight: { frames: 8, row: 4, speed: 200 },
    walkLeft: { frames: 8, row: 5, speed: 200 },
    turn: { frames: 4, row: 7, speed: 150 } // Assuming we have a turning animation
  };

  const WALK_SPEED = 0.5; // pixels per frame
  const EDGE_PADDING = 20; // pixels from the edge of the screen
  const CAT_SCALE = 3;
  const TURN_DURATION = 1000; // milliseconds

  let cat, catState, currentAnimationFrame;
  let isWalking = false;
  let isTurning = false;
  let direction = 1; // 1 for right, -1 for left
  let lastFrameTime = 0;
  let currentPosition = { x: EDGE_PADDING, y: EDGE_PADDING };
  let turnStartTime = 0;

  function createCatElement() {
    const element = document.createElement('div');
    element.id = 'browser-cat';
    document.body.appendChild(element);
    return element;
  }

  function initializeCat() {
    cat.style.backgroundImage = `url(${chrome.runtime.getURL('cat-sprite.png')})`;
    cat.style.width = `${SPRITE_WIDTH}px`;
    cat.style.height = `${SPRITE_HEIGHT}px`;
    cat.style.transform = `scale(${CAT_SCALE})`;
    cat.style.position = 'fixed';
    cat.style.left = `${currentPosition.x}px`;
    cat.style.bottom = `${currentPosition.y}px`;
    cat.style.zIndex = '9999';
    catState = 'idle';
  }

  function updateSprite(state, frame) {
    const row = Math.floor(frame / 4) + STATES[state].row;
    const col = frame % 4;
    cat.style.backgroundPosition = `-${col * SPRITE_WIDTH}px -${row * SPRITE_HEIGHT}px`;
  }

  function animate(state) {
    let frame = 0;
    let lastTime = 0;
    
    function animateFrame(time) {
      if (time - lastTime > STATES[state].speed) {
        updateSprite(state, frame);
        frame = (frame + 1) % STATES[state].frames;
        lastTime = time;
      }
      currentAnimationFrame = requestAnimationFrame(animateFrame);
    }
    
    if (currentAnimationFrame) {
      cancelAnimationFrame(currentAnimationFrame);
    }
    currentAnimationFrame = requestAnimationFrame(animateFrame);
  }

  function handleMouseEnter() {
    if (!isWalking && !isTurning) {
      catState = 'play';
      animate('play');
    }
  }

  function handleMouseLeave() {
    if (!isWalking && !isTurning) {
      catState = 'idle';
      animate('idle');
    }
  }

  function walk(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (isTurning) {
      const turnProgress = (timestamp - turnStartTime) / TURN_DURATION;
      if (turnProgress < 1) {
        const turnFrame = Math.floor(turnProgress * STATES.turn.frames);
        updateSprite('turn', turnFrame);
      } else {
        isTurning = false;
        direction *= -1;
        cat.style.transform = `scale(${CAT_SCALE}) scaleX(${direction})`;
      }
    } else {
      currentPosition.x += direction * WALK_SPEED * (deltaTime / 16.67); // Adjust for frame rate
      cat.style.left = `${currentPosition.x}px`;

      // Check boundaries
      if (currentPosition.x < EDGE_PADDING || currentPosition.x > window.innerWidth - (SPRITE_WIDTH * CAT_SCALE) - EDGE_PADDING) {
        isTurning = true;
        turnStartTime = timestamp;
        animate('turn');
      }
    }

    if (isWalking) {
      requestAnimationFrame(walk);
    } else {
      catState = 'idle';
      animate('idle');
    }
  }

  function startWalking() {
    if (!isWalking) {
      isWalking = true;
      catState = direction === 1 ? 'walkRight' : 'walkLeft';
      animate(catState);
      requestAnimationFrame(walk);

      // Stop walking after a random time between 10 to 20 seconds
      setTimeout(() => {
        isWalking = false;
      }, Math.random() * 10000 + 10000);
    }
  }

  function startRandomWalks() {
    setInterval(() => {
      if (!isWalking && !isTurning && Math.random() < 0.9) { // 20% chance to start walking
        startWalking();
      }
    }, 15000); // Check every 15 seconds
  }

  function init() {
    cat = createCatElement();
    initializeCat();
    animate('idle');
    cat.addEventListener('mouseenter', handleMouseEnter);
    cat.addEventListener('mouseleave', handleMouseLeave);
    startRandomWalks();
  }

  return {
    init: init
  };
})();

// Initialize the Cat Companion
CatCompanion.init();