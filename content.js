const CatCompanion = (function() {
  const SPRITE_WIDTH = 32;
  const SPRITE_HEIGHT = 32;
  const STATES = {
    idle: { frames: 16, row: 0, speed: 200 },
    play: { frames: 8, row: 6, speed: 250 },
    walkRight: { frames: 8, row: 4, speed: 200 },
    walkLeft: { frames: 8, row: 5, speed: 200 }
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
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    currentPosition.x += direction * WALK_SPEED * (deltaTime / 16.67);
    cat.style.left = `${currentPosition.x}px`;

    if (currentPosition.x < EDGE_PADDING || currentPosition.x > window.innerWidth - (SPRITE_WIDTH * CAT_SCALE) - EDGE_PADDING) {
      direction *= -1;
      cat.style.transform = `scale(${CAT_SCALE}) scaleX(${direction})`;
    }

    if (isWalking) {
      requestAnimationFrame(walk);
    } else {
      startPlaying();
    }
  }

  function startWalking() {
    if (!isWalking) {
      isWalking = true;
      catState = direction === 1 ? 'walkRight' : 'walkLeft';
      animate(catState);
      requestAnimationFrame(walk);
    }
  }

  function stopWalking() {
    isWalking = false;
  }

  function startPlaying() {
    catState = 'play';
    animate('play');
    if (playTimeout) clearTimeout(playTimeout);
    playTimeout = setTimeout(() => {
      if (!isWalking) {
        catState = 'idle';
        animate('idle');
      }
    }, PLAY_DURATION);
  }

  function stopPlaying() {
    if (playTimeout) clearTimeout(playTimeout);
    if (!isWalking) {
      catState = 'idle';
      animate('idle');
    }
  }

  function walkAway() {
    startWalking();
    // Choose the direction that leads to the nearest edge
    direction = (currentPosition.x < window.innerWidth / 2) ? -1 : 1;
    cat.style.transform = `scale(${CAT_SCALE}) scaleX(${direction})`;

    // Walk until reaching the edge
    const checkEdge = setInterval(() => {
      if (currentPosition.x <= EDGE_PADDING || currentPosition.x >= window.innerWidth - (SPRITE_WIDTH * CAT_SCALE) - EDGE_PADDING) {
        stopWalking();
        clearInterval(checkEdge);
      }
    }, 100);
  }

  function handleClick() {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < CLICK_TIMEOUT) {
      clickCount++;
      if (clickCount === 3) {
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
    setInterval(() => {
      if (!isWalking && Math.random() < 0.2) {
        startWalking();
        setTimeout(stopWalking, Math.random() * 10000 + 10000);
      }
    }, 15000);
  }

  function init() {
    cat = createCatElement();
    initializeCat();
    animate('idle');
    cat.addEventListener('mouseenter', handleMouseEnter);
    cat.addEventListener('mouseleave', handleMouseLeave);
    cat.addEventListener('click', handleClick);
    startRandomWalks();
  }

  return {
    init: init
  };
})();

// Initialize the Cat Companion
CatCompanion.init();