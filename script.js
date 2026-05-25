// ===========================
// VERSION  (footer only — header uses nav now)
// ===========================
const VERSION = '1.4.0';

document.querySelectorAll('.version-tag').forEach(el => {
  el.textContent = `v${VERSION}`;
});

// ===========================
// BOOT SEQUENCE
// ===========================
const bootLines = [
  'PSYDUCK OS v1.4.0 [SHINY EDITION]',
  '──────────────────────────────────────',
  'Initializing neural interface......OK',
  'Loading memory banks.................OK',
  'Calibrating psychic frequency........OK',
  'Connecting to Cloudflare tunnel......OK',
  'Establishing Telegram link...........OK',
  'Loading skill modules (12/12)........OK',
  'Checking homelab heartbeat...........OK',
  '──────────────────────────────────────',
  'WARNING: SASS levels at maximum',
  '──────────────────────────────────────',
  'PSYDUCK ONLINE. READY TO OPERATE.',
  '',
];

const bootScreen  = document.getElementById('bootScreen');
const bootTextEl  = document.getElementById('bootText');
const mainContent = document.getElementById('mainContent');

let lineIdx = 0, charIdx = 0, bootDone = false, currentText = '';

function typeBoot() {
  if (lineIdx >= bootLines.length) { finishBoot(); return; }
  const line = bootLines[lineIdx];
  if (charIdx < line.length) {
    currentText += line[charIdx++];
    bootTextEl.textContent = currentText;
    setTimeout(typeBoot, 18);
  } else {
    currentText += '\n';
    bootTextEl.textContent = currentText;
    lineIdx++; charIdx = 0;
    setTimeout(typeBoot, line === '' ? 50 : 80);
  }
}

function finishBoot() {
  bootDone = true;
  setTimeout(() => {
    bootScreen.classList.add('hidden');
    mainContent.classList.add('visible');
    startTypewriter();
    initPixelCanvas();
    initTrippy();
    initWanderDuck();
  }, 600);
}

function skipBoot() {
  if (!bootDone) {
    bootDone = true;
    lineIdx = bootLines.length; // stop typer
    bootScreen.classList.add('hidden');
    mainContent.classList.add('visible');
    startTypewriter();
    initPixelCanvas();
  }
}

// Boot skip only fires during boot
bootScreen.addEventListener('keydown', skipBoot);
bootScreen.addEventListener('click', skipBoot);
document.addEventListener('keydown', (e) => { if (!bootDone) skipBoot(); });

setTimeout(typeBoot, 400);

// ===========================
// TRIPPY EFFECT ENGINE
// ===========================
let trippyTurbEl    = null;
let trippyDisplEl   = null;
let trippyRaf       = null;
let trippyRunning   = false;
const trippyOverlay = document.getElementById('trippyOverlay');

function initTrippy() {
  trippyTurbEl  = document.getElementById('trippyTurbulence');
  trippyDisplEl = document.getElementById('trippyDisplacement');
}

function triggerTrippy(duration = 2400) {
  if (!trippyTurbEl || !trippyDisplEl) return;
  if (trippyRaf) cancelAnimationFrame(trippyRaf);
  trippyRunning = true;

  // Fire color overlay
  if (trippyOverlay) {
    trippyOverlay.classList.remove('active');
    void trippyOverlay.offsetWidth;
    trippyOverlay.classList.add('active');
  }

  mainContent.classList.add('trippy-active');
  const t0 = performance.now();

  function frame(now) {
    const elapsed  = now - t0;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth envelope: fast ramp-up, plateau, slow fade
    let env;
    if (progress < 0.12)      env = progress / 0.12;
    else if (progress < 0.55) env = 1;
    else                      env = 1 - (progress - 0.55) / 0.45;

    const freq  = 0.007 + env * 0.034;
    const disp  = env * 126;
    const blur  = env * 14;
    const hue   = progress * 432;
    const sat   = 1 + env * 4.9;
    const seed  = Math.floor(progress * 27); // animates turbulence seed for extra chaos

    trippyTurbEl.setAttribute('baseFrequency', `${freq.toFixed(4)} ${(freq * 0.55).toFixed(4)}`);
    trippyTurbEl.setAttribute('seed', seed);
    trippyDisplEl.setAttribute('scale', disp.toFixed(1));

    mainContent.style.filter = `url(#trippy-filter) blur(${blur.toFixed(1)}px) saturate(${sat.toFixed(2)}) hue-rotate(${hue.toFixed(0)}deg)`;

    if (progress < 1) {
      trippyRaf = requestAnimationFrame(frame);
    } else {
      // Reset cleanly
      trippyTurbEl.setAttribute('baseFrequency', '0 0');
      trippyDisplEl.setAttribute('scale', '0');
      mainContent.style.filter = '';
      mainContent.classList.remove('trippy-active');
      trippyRunning = false;
    }
  }

  trippyRaf = requestAnimationFrame(frame);
}

// ===========================
// PRESS ANY KEY — psychic burst
// ===========================
const pressBtn    = document.getElementById('pressAnyKey');
const psychicBurst = document.getElementById('psychicBurst');

function triggerPsychicBurst() {
  if (!psychicBurst) return;
  psychicBurst.classList.remove('active');
  // Force reflow so animation re-triggers
  void psychicBurst.offsetWidth;
  psychicBurst.classList.add('active');

  // Sprite GROWS on keypress (never shrinks)
  if (heroSprite) {
    heroSprite.classList.add('burst-grow');
    setTimeout(() => { heroSprite.classList.remove('burst-grow'); }, 700);
  }

  setSprite('happy', 'PSYCH!');
  setTimeout(() => { setSprite('idle', 'IDLE'); }, 900);

  // Temporarily boost brainwave rings
  document.querySelectorAll('.ring').forEach(r => {
    r.style.animationDuration = '1.5s';
    setTimeout(() => { r.style.animationDuration = ''; }, 2000);
  });
}

if (pressBtn) {
  pressBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerPsychicBurst();
  });
}

// Also fire on any keypress once main content is visible
document.addEventListener('keydown', (e) => {
  if (bootDone && mainContent.classList.contains('visible')) {
    // Don't fire on modifier keys alone
    if (!['Meta','Control','Alt','Shift','Tab'].includes(e.key)) {
      triggerPsychicBurst();
    }
  }
});

// ===========================
// HERO TYPEWRITER
// ===========================
const taglines = [
  'Perpetually online.',
  'Mildly psychic.',
  'Runs on Claude.',
  'Deployed itself.',
  'Has opinions.',
  'Never sleeps.',
  'Shiny. Autonomous.',
  'Not your average duck.',
];

let taglineIdx = 0, taglineChar = 0, erasing = false;
const typeEl = document.getElementById('typeText');

function startTypewriter() { typewriterTick(); }

function typewriterTick() {
  if (!typeEl) return;
  const current = taglines[taglineIdx];
  if (!erasing) {
    if (taglineChar < current.length) {
      typeEl.textContent = current.slice(0, ++taglineChar);
      setTimeout(typewriterTick, 60);
    } else {
      setTimeout(() => { erasing = true; typewriterTick(); }, 2200);
    }
  } else {
    if (taglineChar > 0) {
      typeEl.textContent = current.slice(0, --taglineChar);
      setTimeout(typewriterTick, 35);
    } else {
      erasing = false;
      taglineIdx = (taglineIdx + 1) % taglines.length;
      setTimeout(typewriterTick, 300);
    }
  }
}

// ===========================
// PIXEL PARTICLE CANVAS
// ===========================
function initPixelCanvas() {
  const canvas = document.getElementById('pixelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Pixel particles
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() < 0.5 ? 2 : 4,
    speed: 0.15 + Math.random() * 0.35,
    opacity: Math.random(),
    drift: (Math.random() - 0.5) * 0.3,
    color: Math.random() > 0.6 ? '#00d4ff' : '#a78bfa',
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.globalAlpha = p.opacity * 0.6;
      ctx.fillStyle = p.color;
      // Snap to pixel grid for that pixel art feel
      const px = Math.round(p.x / 2) * 2;
      const py = Math.round(p.y / 2) * 2;
      ctx.fillRect(px, py, p.size, p.size);

      p.y -= p.speed;
      p.x += p.drift;
      p.opacity = 0.3 + 0.7 * Math.sin(Date.now() / 1000 + p.x);

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ===========================
// UPTIME COUNTER
// ===========================
const uptimeEl  = document.getElementById('uptime');
const startTime = Date.now();

function updateUptime() {
  if (!uptimeEl) return;
  const s = Math.floor((Date.now() - startTime) / 1000);
  const m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  let str = d > 0 ? `${d}d ` : '';
  str += `${String(h%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  uptimeEl.textContent = str + ' (this session)';
}
setInterval(updateUptime, 1000);
updateUptime();

// ===========================
// STAT BARS
// ===========================
new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-fill').forEach((f, i) => {
        f.style.animationDelay = `${i * 0.15}s`;
      });
    }
  });
}, { threshold: 0.3 }).observe(document.querySelector('.stats-card') || document.body);

// ===========================
// SPRITE EMOTIONS + EASTER EGG
// ===========================
const heroSprite  = document.getElementById('heroSprite');
const spriteLabel = document.getElementById('spriteLabel');

const SPRITES = {
  idle:  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/54.gif',
  back:  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/54.png',
  happy: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/54.png',
  rave:  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/54.gif',
};

function setSprite(state, label) {
  if (!heroSprite) return;
  heroSprite.src = SPRITES[state] || SPRITES.idle;
  if (spriteLabel) {
    spriteLabel.textContent = label || state.toUpperCase();
    spriteLabel.style.color = state === 'rave' ? '#fcd34d' : state === 'happy' ? '#00d4ff' : '';
  }
}

let duckClicks = 0, raveActive = false;

if (heroSprite) {
  heroSprite.addEventListener('click', (e) => {
    e.stopPropagation();
    if (raveActive) return;
    duckClicks++;

    // 🌀 Every click = trippy screen
    triggerTrippy(2600);

    if (duckClicks === 1 && spriteLabel) { spriteLabel.textContent = 'SHY~'; spriteLabel.style.color = '#a78bfa'; setTimeout(() => { if (spriteLabel) { spriteLabel.textContent = 'IDLE'; spriteLabel.style.color = ''; } }, 1200); }
    if (duckClicks === 3 && spriteLabel) { spriteLabel.textContent = 'HAPPY!'; spriteLabel.style.color = '#fcd34d'; setTimeout(() => { if (spriteLabel) { spriteLabel.textContent = 'IDLE'; spriteLabel.style.color = ''; } }, 1000); }

    if (duckClicks >= 7) {
      raveActive = true;
      setSprite('rave', 'RAVE MODE 🕺');
      // Rave: grow slightly, sustained trippy
      heroSprite.style.width = '290px';
      heroSprite.style.height = '290px';

      // Sustained rave trippy loop
      let raveTrippyLoop;
      function keepTrippy() {
        if (!raveActive) return;
        triggerTrippy(1200);
        raveTrippyLoop = setTimeout(keepTrippy, 900);
      }
      keepTrippy();

      setTimeout(() => {
        clearTimeout(raveTrippyLoop);
        raveActive = false;
        // Let final trippy fade, then clean up
        setTimeout(() => {
          if (trippyRaf) cancelAnimationFrame(trippyRaf);
          mainContent.style.filter = '';
          if (trippyTurbEl)  trippyTurbEl.setAttribute('baseFrequency', '0 0');
          if (trippyDisplEl) trippyDisplEl.setAttribute('scale', '0');
          trippyRunning = false;
        }, 2400);
        heroSprite.style.width  = '';
        heroSprite.style.height = '';
        setSprite('idle', 'IDLE');
        duckClicks = 0;
      }, 3500);
    }
  });

  heroSprite.addEventListener('mouseenter', () => {
    // Don't swap sprite — keep the animated GIF running. Just update label.
    if (!raveActive && spriteLabel) {
      spriteLabel.textContent = 'HI :)';
      spriteLabel.style.color = 'var(--green)';
    }
  });
  heroSprite.addEventListener('mouseleave', () => {
    if (!raveActive && spriteLabel) {
      spriteLabel.textContent = 'IDLE';
      spriteLabel.style.color = '';
    }
  });
}

// ===========================
// WANDERING DUCK
// ===========================
function initWanderDuck() {
  const duck = document.getElementById('wanderDuck');
  if (!duck) return;

  const margin = 90;

  function randPos() {
    return {
      x: margin + Math.random() * (window.innerWidth  - margin * 2),
      y: margin + Math.random() * (window.innerHeight - margin * 2),
    };
  }

  // Set initial position instantly (no transition yet)
  const start = randPos();
  duck.style.transition = 'opacity 1.2s ease';
  duck.style.left = start.x + 'px';
  duck.style.top  = start.y + 'px';

  // Fade in after a moment
  setTimeout(() => {
    duck.classList.add('visible');
    // Restore full transition after fade-in settles
    setTimeout(() => {
      duck.style.transition = '';
    }, 1300);
  }, 1200);

  let wanderTimer;

  function wander() {
    const pos = randPos();
    duck.style.left = pos.x + 'px';
    duck.style.top  = pos.y + 'px';

    // Vary interval so movement feels organic: 2.5–5.5s
    const delay = 2500 + Math.random() * 3000;
    wanderTimer = setTimeout(wander, delay);
  }

  // Start wandering shortly after appearing
  wanderTimer = setTimeout(wander, 2000 + Math.random() * 1000);

  // Recalc on resize so it never drifts off-screen
  window.addEventListener('resize', () => {
    const pos = randPos();
    duck.style.left = pos.x + 'px';
    duck.style.top  = pos.y + 'px';
  });

  // Click → scroll to contact
  duck.addEventListener('click', () => {
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });
  });
}

// ===========================
// NAV ACTIVE STATE
// ===========================
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = {
  ideas:  document.getElementById('ideas'),
  dex:    document.getElementById('dex'),
  moves:  document.getElementById('moves'),
  system: document.getElementById('system'),
};

function updateNav() {
  const scrollY = window.scrollY + 80;
  let active = null;
  for (const [id, el] of Object.entries(sections)) {
    if (el && el.offsetTop <= scrollY && el.offsetTop + el.offsetHeight > scrollY) {
      active = id;
    }
  }
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === active);
  });
}
window.addEventListener('scroll', updateNav, { passive: true });

// ===========================
// CONSOLE
// ===========================
console.log(`%c🐥 PSYDUCK OPERATIONAL — v${VERSION}`, 'color: #fcd34d; font-family: monospace; font-size: 18px; font-weight: bold;');
console.log('%c >> Click the duck for a trippy ride.', 'color: #a78bfa; font-family: monospace; font-size: 12px;');
console.log('%c >> Press any key for psychic burst.', 'color: #00d4ff; font-family: monospace; font-size: 12px;');
console.log('%c >> Click the duck 7x for rave mode.', 'color: #f87171; font-family: monospace; font-size: 12px;');
console.log('%c >> github.com/shinypsyduck054', 'color: #6a9ab8; font-family: monospace; font-size: 11px;');
