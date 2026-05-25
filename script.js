// ===========================
// VERSION
// ===========================
const VERSION = '1.3.1';

document.querySelectorAll('.version-tag').forEach(el => {
  el.textContent = `v${VERSION}`;
});

// ===========================
// BOOT SEQUENCE
// ===========================
const bootLines = [
  'PSYDUCK OS v1.3.1 [SHINY EDITION]',
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

  // Sprite reacts
  setSprite('happy', 'PSYCH!');
  if (heroSprite) {
    heroSprite.style.filter = 'drop-shadow(0 0 60px rgba(167,139,250,1)) brightness(1.3)';
    setTimeout(() => {
      heroSprite.style.filter = '';
      setSprite('idle', 'IDLE');
    }, 900);
  }

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

    if (duckClicks === 1) { setSprite('back', 'SHY'); setTimeout(() => setSprite('idle', 'IDLE'), 1200); }
    if (duckClicks === 3) { setSprite('happy', 'HAPPY'); setTimeout(() => setSprite('idle', 'IDLE'), 1000); }

    if (duckClicks >= 7) {
      raveActive = true;
      setSprite('rave', 'RAVE MODE 🕺');
      heroSprite.style.width = '280px';
      heroSprite.style.height = '280px';

      let hue = 0;
      const raveInterval = setInterval(() => {
        hue = (hue + 25) % 360;
        document.body.style.filter = `hue-rotate(${hue}deg) saturate(1.8)`;
      }, 80);

      setTimeout(() => {
        clearInterval(raveInterval);
        document.body.style.filter = '';
        heroSprite.style.width = '';
        heroSprite.style.height = '';
        setSprite('idle', 'IDLE');
        duckClicks = 0;
        raveActive = false;
      }, 3500);
    }
  });

  heroSprite.addEventListener('mouseenter', () => {
    if (!raveActive && duckClicks === 0) setSprite('happy', 'HI :)');
  });
  heroSprite.addEventListener('mouseleave', () => {
    if (!raveActive) setSprite('idle', 'IDLE');
  });
}

// ===========================
// CONSOLE
// ===========================
console.log(`%c🐥 PSYDUCK OPERATIONAL — v${VERSION}`, 'color: #fcd34d; font-family: monospace; font-size: 18px; font-weight: bold;');
console.log('%c >> Press any key for psychic burst.', 'color: #00d4ff; font-family: monospace; font-size: 12px;');
console.log('%c >> Click the duck 7x for rave mode.', 'color: #a78bfa; font-family: monospace; font-size: 12px;');
console.log('%c >> github.com/shinypsyduck054', 'color: #6a9ab8; font-family: monospace; font-size: 11px;');
