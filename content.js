(function() {
    // Create cat element
    const cat = document.createElement('div');
    cat.id = 'browser-cat';
    document.body.appendChild(cat);
  
    // Cat state
    let catState = 'idle';
    let lastInteraction = Date.now();
  
    // Sprite animation settings
    const spriteWidth = 100;
    const spriteHeight = 100;
    const states = {
      idle: { frames: 4, row: 0 },
      walk: { frames: 8, row: 1 },
      play: { frames: 6, row: 2 },
      jump: { frames: 7, row: 3 }
    };
  
    function updateSprite(state, frame) {
      const row = states[state].row;
      cat.style.backgroundPosition = `-${frame * spriteWidth}px -${row * spriteHeight}px`;
    }
  
    // Cat behaviors
    function updateCatBehavior() {
      const now = Date.now();
      if (now - lastInteraction > 10000) { // 10 seconds of no interaction
        if (Math.random() < 0.3) { // 30% chance to do something
          const actions = ['jump', 'play', 'walk'];
          catState = actions[Math.floor(Math.random() * actions.length)];
          performAction(catState);
        }
      }
    }
  
    function performAction(action) {
      let frame = 0;
      const animationInterval = setInterval(() => {
        updateSprite(action, frame);
        frame = (frame + 1) % states[action].frames;
        if (frame === 0 && action !== 'play') {
          clearInterval(animationInterval);
          catState = 'idle';
          updateSprite('idle', 0);
        }
      }, 100);
  
      if (action === 'walk') {
        cat.style.animation = 'walk 2s';
        setTimeout(() => {
          cat.style.animation = '';
        }, 2000);
      }
  
      if (action === 'jump') {
        cat.style.animation = 'jump 0.5s';
        setTimeout(() => {
          cat.style.animation = '';
        }, 500);
      }
    }
  
    // Interaction
    cat.addEventListener('mouseenter', () => {
      if (catState === 'idle') {
        performAction('play');
        lastInteraction = Date.now();
      }
    });
  
    cat.addEventListener('mouseleave', () => {
      if (catState === 'play') {
        catState = 'idle';
        updateSprite('idle', 0);
      }
    });
  
    cat.addEventListener('click', () => {
      performAction('jump');
      lastInteraction = Date.now();
    });
  
    // Update cat behavior every second
    setInterval(updateCatBehavior, 1000);
  
    // Initial state
    updateSprite('idle', 0);
  })();