const CatCompanion = (function() {
    const SPRITE_WIDTH = 32;
    const SPRITE_HEIGHT = 32;
    const STATES = {
      idle: { frames: 16, row: 0, speed: 200 },
      play: { frames: 8, row: 6, speed: 250 },
    };
  
    let cat, catState, currentInterval;
  
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
      cat.style.position = 'fixed';
      cat.style.right = '10px';
      cat.style.bottom = '10px';
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
      const frameCount = STATES[state].frames;
      if (currentInterval) clearInterval(currentInterval);
      currentInterval = setInterval(() => {
        updateSprite(state, frame);
        frame = (frame + 1) % frameCount;
      }, STATES[state].speed);
    }
  
    function handleMouseEnter() {
      catState = 'play';
      animate('play');
    }
  
    function handleMouseLeave() {
      catState = 'idle';
      animate('idle');
    }
  
    function init() {
      cat = createCatElement();
      initializeCat();
      animate('idle');
      cat.addEventListener('mouseenter', handleMouseEnter);
      cat.addEventListener('mouseleave', handleMouseLeave);
    }
  
    return {
      init: init
    };
  })();
  
  // Initialize the Cat Companion
  CatCompanion.init();