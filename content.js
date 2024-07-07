const CatCompanion = (function() {
    const DEBUG = true;
    const SPRITE_WIDTH = 32;
    const SPRITE_HEIGHT = 32;
    const STATES = {
      idle: { frames: 16, row: 0, speed: 200 },
      walk: { frames: 8, row: 4, speed: 150 },
      play: { frames: 8, row: 6, speed: 250 }
    };
  
    let cat, catState, lastInteraction, currentInterval;
  
    function log(message) {
      if (DEBUG) {
        console.log(`[Cat Companion] ${message}`);
      }
    }
  
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
      cat.style.transform = 'scale(3)';
      catState = 'idle';
      lastInteraction = Date.now();
    }
  
    function updateSprite(state, frame) {
      const row = Math.floor(frame / 4) + STATES[state].row;
      const col = frame % 4;
      cat.style.backgroundPosition = `-${col * SPRITE_WIDTH}px -${row * SPRITE_HEIGHT}px`;
    }
  
    function animate(state) {
      let frame = 0;
      const frameCount = STATES[state].frames;
      if (currentInterval) clearInterval(currentInterval);
      currentInterval = setInterval(() => {
        updateSprite(state, frame);
        frame = (frame + 1) % frameCount;
        if (frame === 0 && state !== 'idle') {
          clearInterval(currentInterval);
          animate('idle');
        }
      }, STATES[state].speed);
    }
  
    function performAction(action) {
      log(`Performing action: ${action}`);
      catState = action;
      animate(action);
      if (action === 'walk') {
        cat.style.animation = 'walk 6s linear';
        setTimeout(() => {
          cat.style.animation = '';
        }, 6000);
      }
    }
  
    function handleMouseEnter() {
      if (catState !== 'play') {
        performAction('play');
        lastInteraction = Date.now();
      }
    }
  
    function handleMouseLeave() {
      if (catState === 'play') {
        performAction('idle');
      }
    }
  
    function handleClick() {
      performAction('walk');
      lastInteraction = Date.now();
    }
  
    function checkIdleAction() {
      const now = Date.now();
      if (now - lastInteraction > 10000 && catState === 'idle') {
        if (Math.random() < 0.3) {
          performAction('walk');
        }
      }
    }
  
    function setupEventListeners() {
      cat.addEventListener('mouseenter', handleMouseEnter);
      cat.addEventListener('mouseleave', handleMouseLeave);
      cat.addEventListener('click', handleClick);
      setInterval(checkIdleAction, 1000);
    }
  
    function startIdleAnimation() {
      animate('idle');
    }
  
    return {
      init: function() {
        log('Initializing Cat Companion');
        cat = createCatElement();
        initializeCat();
        setupEventListeners();
        startIdleAnimation();
      }
    };
  })();
  
  // Initialize the Cat Companion
  CatCompanion.init();