// ===========================
// VERSION  (footer only — header uses nav now)
// ===========================
const VERSION = '1.6.0';

document.querySelectorAll('.version-tag').forEach(el => {
  el.textContent = `v${VERSION}`;
});

// ===========================
// BOOT SEQUENCE
// ===========================
const bootLines = [
  'PSYDUCK OS v1.6.0 [SHINY EDITION]',
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

// (press-any-key and psychic burst removed)

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
      setSprite('rave', 'RAVE MODE');
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
// WANDERING DUCK — balloon physics
// ===========================
function initWanderDuck() {
  const duck = document.getElementById('wanderDuck');
  if (!duck) return;

  const SIZE    = 70;
  const MARGIN  = 24;
  const TOP_PAD = 70; // clear the header

  // Physics state
  let x, y, vx, vy;
  let rot      = 0;
  let rotSpeed = (Math.random() - 0.5) * 0.012; // deg/frame, very slow
  let unlocked = false;
  let rafId    = null;

  // Park it off the bottom of the screen initially
  x = MARGIN + Math.random() * (window.innerWidth - SIZE - MARGIN * 2);
  y = window.innerHeight + SIZE + 40;
  duck.style.transition = 'opacity 1.4s ease';
  duck.style.left = x + 'px';
  duck.style.top  = y + 'px';

  function startPhysics() {
    let lastTs = null;

    function frame(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      const W = window.innerWidth;
      const H = window.innerHeight;

      // Gentle wind nudge each frame
      vx += (Math.random() - 0.5) * 0.008;
      vy += (Math.random() - 0.5) * 0.008;

      // Clamp to balloon-slow speed
      const speed = Math.sqrt(vx * vx + vy * vy);
      const MAX_V = 0.28;
      const MIN_V = 0.04;
      if (speed > MAX_V) { vx = (vx / speed) * MAX_V; vy = (vy / speed) * MAX_V; }
      if (speed < MIN_V) { vx += (Math.random() - 0.5) * 0.025; vy += (Math.random() - 0.5) * 0.025; }

      x += vx * dt * 0.35;
      y += vy * dt * 0.35;

      // Soft bounce off edges
      const L = MARGIN, R = W - SIZE - MARGIN;
      const T = TOP_PAD, B = H - SIZE - MARGIN;
      if (x < L) { x = L; vx =  Math.abs(vx) * 0.7 + 0.06; }
      if (x > R) { x = R; vx = -Math.abs(vx) * 0.7 - 0.06; }
      if (y < T) { y = T; vy =  Math.abs(vy) * 0.7 + 0.06; }
      if (y > B) { y = B; vy = -Math.abs(vy) * 0.7 - 0.06; }

      // Rotation: slow drift, gently nudged, capped at ±38°
      rotSpeed += (Math.random() - 0.5) * 0.0006;
      rotSpeed  = Math.max(-0.025, Math.min(0.025, rotSpeed));
      rot      += rotSpeed * dt * 0.5;
      if (rot >  38) { rot =  38; rotSpeed *= -0.6; }
      if (rot < -38) { rot = -38; rotSpeed *= -0.6; }

      duck.style.left      = x + 'px';
      duck.style.top       = y + 'px';
      duck.style.transform = `rotate(${rot.toFixed(2)}deg)`;

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;

    // Spawn at the bottom, random x
    x  = MARGIN + Math.random() * (window.innerWidth - SIZE - MARGIN * 2);
    y  = window.innerHeight - SIZE - 8;
    vx = (Math.random() - 0.5) * 0.4;
    vy = -(0.35 + Math.random() * 0.25); // float up gently

    duck.style.left = x + 'px';
    duck.style.top  = y + 'px';

    // Fade in, then hand off to physics
    requestAnimationFrame(() => {
      duck.classList.add('visible');
      setTimeout(() => {
        duck.style.transition = 'opacity 1.4s ease'; // keep only for hover
        startPhysics();
      }, 1400);
    });
  }

  // Unlock on first meaningful scroll
  function onScroll() {
    if (window.scrollY > 80) {
      unlock();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Re-clamp on resize
  window.addEventListener('resize', () => {
    if (!unlocked) return;
    const W = window.innerWidth, H = window.innerHeight;
    x = Math.max(MARGIN, Math.min(W - SIZE - MARGIN, x));
    y = Math.max(TOP_PAD, Math.min(H - SIZE - MARGIN, y));
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
console.log('%c >> Click the duck 7x for rave mode.', 'color: #f87171; font-family: monospace; font-size: 12px;');
console.log('%c >> github.com/shinypsyduck054', 'color: #6a9ab8; font-family: monospace; font-size: 11px;');
