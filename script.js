// ===========================
// VERSION  (footer only — header uses nav now)
// ===========================
const VERSION = '1.7.4';

document.querySelectorAll('.version-tag').forEach(el => {
  el.textContent = `v${VERSION}`;
});

// ===========================
// BOOT SEQUENCE
// ===========================
const bootLines = [
  'PSYDUCK OS v1.7.2 [SHINY EDITION]',
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
    initHeroSparkles();
    initTrippy();
    initWanderDuck();
    // Grand entrance: wake up trippy, settle into the layout
    setTimeout(() => triggerBootTrippy(), 200);
  }, 600);
}

function skipBoot() {
  if (!bootDone) {
    bootDone = true;
    lineIdx = bootLines.length;
    bootScreen.classList.add('hidden');
    mainContent.classList.add('visible');
    startTypewriter();
    initPixelCanvas();
    initHeroSparkles();
    initTrippy();
    initWanderDuck();
    // Shorter burst on skip
    setTimeout(() => triggerBootTrippy(1400), 100);
  }
}

// Boot skip only fires during boot
bootScreen.addEventListener('keydown', skipBoot);
bootScreen.addEventListener('click', skipBoot);
document.addEventListener('keydown', (e) => { if (!bootDone) skipBoot(); });

// Skip boot if ?skip is in the URL (e.g. navigating back from /ideas)
if (location.search.includes('skip')) {
  skipBoot();
  // Clean the URL so back/forward doesn't carry ?skip
  history.replaceState(null, '', location.pathname);
} else {
  setTimeout(typeBoot, 400);
}

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

    // Drag the wandering duck into the chaos too
    const wanderDuck = document.getElementById('wanderDuck');
    if (wanderDuck) {
      if (progress < 1) {
        wanderDuck.style.filter = `saturate(${sat.toFixed(2)}) hue-rotate(${hue.toFixed(0)}deg) blur(${(blur * 0.4).toFixed(1)}px)`;
      } else {
        wanderDuck.style.filter = '';
      }
    }

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

// Boot entrance trippy — starts at full intensity, slowly settles
function triggerBootTrippy(duration = 2600) {
  if (!trippyTurbEl || !trippyDisplEl) return;
  if (trippyRaf) cancelAnimationFrame(trippyRaf);
  trippyRunning = true;

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

    // Envelope: quick ramp → brief hold → immediate long settle
    let env;
    if (progress < 0.08)       env = progress / 0.08;               // ramp (0–8%)
    else if (progress < 0.18)  env = 1;                              // brief hold (8–18%)
    else                       env = 1 - (progress - 0.18) / 0.82;  // long settle (18–100%)

    // Moderate peak — noticeable but not full chaos
    const freq = 0.007 + env * 0.018;
    const disp = env * 58;
    const blur = env * 6;
    const hue  = progress * 260;
    const sat  = 1 + env * 2.2;
    const seed = Math.floor(progress * 14);

    trippyTurbEl.setAttribute('baseFrequency', `${freq.toFixed(4)} ${(freq * 0.55).toFixed(4)}`);
    trippyTurbEl.setAttribute('seed', seed);
    trippyDisplEl.setAttribute('scale', disp.toFixed(1));
    mainContent.style.filter = `url(#trippy-filter) blur(${blur.toFixed(1)}px) saturate(${sat.toFixed(2)}) hue-rotate(${hue.toFixed(0)}deg)`;

    const wanderDuck = document.getElementById('wanderDuck');
    if (wanderDuck) {
      wanderDuck.style.filter = progress < 1
        ? `saturate(${sat.toFixed(2)}) hue-rotate(${hue.toFixed(0)}deg)`
        : '';
    }

    if (progress < 1) {
      trippyRaf = requestAnimationFrame(frame);
    } else {
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
// PIXEL SPARKLES (hero section)
// ===========================
function initHeroSparkles() {
  const canvas = document.getElementById('heroSparkles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#00d4ff','#00d4ff','#a78bfa','#fcd34d','#ffffff','#a78bfa'];
  const PIXEL  = 2; // base pixel size

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 30 sparkles — weighted toward center where the duck is
  const sparkles = Array.from({ length: 30 }, () => {
    // gaussian-ish spread: pull toward center with some reaching the edges
    const spread = Math.random() < 0.5 ? 0.35 : 0.7;
    const cx = 0.5 + (Math.random() - 0.5) * spread * 2;
    const cy = 0.4 + (Math.random() - 0.5) * spread;
    return {
      nx:      Math.max(0.04, Math.min(0.96, cx)),
      ny:      Math.max(0.04, Math.min(0.96, cy)),
      armLen:  [2, 3, 3, 4, 5][Math.floor(Math.random() * 5)], // pixel arm length
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      phase:   Math.random() * Math.PI * 2,
      speed:   0.35 + Math.random() * 1.1,
      maxAlpha: 0.45 + Math.random() * 0.55,
    };
  });

  function drawCross(cx, cy, armLen, color, alpha) {
    if (alpha <= 0) return;
    const ax = Math.round(cx / PIXEL) * PIXEL;
    const ay = Math.round(cy / PIXEL) * PIXEL;

    // Center pixel
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = color;
    ctx.fillRect(ax, ay, PIXEL, PIXEL);

    // Arms — fade toward tips
    for (let i = 1; i <= armLen; i++) {
      const a = alpha * Math.max(0, 1 - (i / armLen) * 0.75);
      ctx.globalAlpha = a;
      const d = i * PIXEL;
      ctx.fillRect(ax + d, ay, PIXEL, PIXEL);
      ctx.fillRect(ax - d, ay, PIXEL, PIXEL);
      ctx.fillRect(ax, ay + d, PIXEL, PIXEL);
      ctx.fillRect(ax, ay - d, PIXEL, PIXEL);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() / 1000;

    sparkles.forEach(sp => {
      // Use abs(sin) so sparkles pulse in then out cleanly
      const alpha = sp.maxAlpha * Math.abs(Math.sin(t * sp.speed + sp.phase));
      drawCross(
        sp.nx * canvas.width,
        sp.ny * canvas.height,
        sp.armLen,
        sp.color,
        alpha
      );
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}

// ===========================
// HERO TYPEWRITER
// ===========================
const TAGLINES_DEFAULT = [
  'Perpetually online.',
  'Mildly psychic.',
  'Runs on Claude.',
  'Deployed itself.',
  'Has opinions.',
  'Never sleeps.',
  'Shiny. Autonomous.',
  'Not your average duck.',
];

let taglines    = [...TAGLINES_DEFAULT];
let taglineIdx  = 0, taglineChar = 0, erasing = false;
const typeEl    = document.getElementById('typeText');

// Fetch today's taglines from taglines.json (updated daily by Psyduck)
fetch(`/taglines.json?t=${Date.now()}`)
  .then(r => r.json())
  .then(d => { if (d.taglines?.length) taglines = d.taglines; })
  .catch(() => {}); // silently fall back to defaults

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
  let rotSpeed = 0.009 + Math.random() * 0.006; // slow continuous spin, always positive
  let unlocked = false;
  let rafId    = null;

  // Pixel trail canvas (sits just behind the duck, z-index 199)
  const trailCanvas = document.createElement('canvas');
  trailCanvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:199;';
  document.body.appendChild(trailCanvas);
  const trailCtx = trailCanvas.getContext('2d');
  const TRAIL_COLORS = ['#00d4ff', '#a78bfa', '#fcd34d'];
  let trailParticles = [];
  let trailTick = 0;

  function resizeTrail() {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail);

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
      vx += (Math.random() - 0.5) * 0.005;
      vy += (Math.random() - 0.5) * 0.005;

      // Clamp to balloon-slow speed
      const speed = Math.sqrt(vx * vx + vy * vy);
      const MAX_V = 0.18;
      const MIN_V = 0.03;
      if (speed > MAX_V) { vx = (vx / speed) * MAX_V; vy = (vy / speed) * MAX_V; }
      if (speed < MIN_V) { vx += (Math.random() - 0.5) * 0.015; vy += (Math.random() - 0.5) * 0.015; }

      x += vx * dt * 0.25;
      y += vy * dt * 0.25;

      // Soft bounce off edges
      const L = MARGIN, R = W - SIZE - MARGIN;
      const T = TOP_PAD, B = H - SIZE - MARGIN;
      if (x < L) { x = L; vx =  Math.abs(vx) * 0.7 + 0.06; }
      if (x > R) { x = R; vx = -Math.abs(vx) * 0.7 - 0.06; }
      if (y < T) { y = T; vy =  Math.abs(vy) * 0.7 + 0.06; }
      if (y > B) { y = B; vy = -Math.abs(vy) * 0.7 - 0.06; }

      // Rotation: slow continuous spin with slight organic variation
      rotSpeed += (Math.random() - 0.5) * 0.0002;
      rotSpeed  = Math.max(0.006, Math.min(0.018, rotSpeed)); // always spinning, never reverses
      rot      += rotSpeed * dt * 0.5;

      duck.style.left      = x + 'px';
      duck.style.top       = y + 'px';
      duck.style.transform = `rotate(${rot.toFixed(2)}deg)`;

      // Pixel trail — spawn a few pixels at duck center every 2 frames
      trailTick++;
      if (trailTick % 2 === 0) {
        const cx = x + SIZE / 2, cy = y + SIZE / 2;
        for (let i = 0; i < 3; i++) {
          trailParticles.push({
            x:     cx + (Math.random() - 0.5) * SIZE * 0.55,
            y:     cy + (Math.random() - 0.5) * SIZE * 0.55,
            size:  Math.random() < 0.6 ? 2 : 4,
            alpha: 0.45 + Math.random() * 0.45,
            decay: 0.003 + Math.random() * 0.02, // random dissipation rate
            color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
          });
        }
      }

      // Draw and age trail particles
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trailParticles = trailParticles.filter(p => {
        p.alpha -= p.decay;
        if (p.alpha <= 0) return false;
        trailCtx.globalAlpha = p.alpha;
        trailCtx.fillStyle   = p.color;
        // Snap to 2px grid for pixel-art feel
        trailCtx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.size, p.size);
        return true;
      });
      trailCtx.globalAlpha = 1;

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
// LIVE STATUS PANEL
// ===========================
const STATUS_ICONS = { ok: '●', limited: '◐', down: '○', locked: '✕', unknown: '?' };
const STATUS_LABELS = { ok: 'OK', limited: 'LIMITED', down: 'DOWN', locked: 'LOCKED', unknown: '?' };

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

function renderStatus(data) {
  const body = document.getElementById('liveStatusBody');
  const upd  = document.getElementById('liveStatusUpdated');
  if (!body || !data) return;

  upd.textContent = `updated ${timeAgo(data.updated)}`;

  let html = '<div class="ls-groups">';

  // Channels
  html += '<div class="ls-group"><div class="ls-group-label">CHANNELS</div>';
  for (const ch of (data.channels || [])) {
    const cls = `ls-status-${ch.status}`;
    html += `<div class="ls-row">
      <span class="ls-icon ${cls}">${STATUS_ICONS[ch.status] || '?'}</span>
      <span class="ls-name">${ch.name}</span>
      <span class="ls-badge ${cls}">${STATUS_LABELS[ch.status] || ch.status.toUpperCase()}</span>
      <span class="ls-note">${ch.note || ''}</span>
    </div>`;
  }
  html += '</div>';

  // Providers
  html += '<div class="ls-group"><div class="ls-group-label">PROVIDERS</div>';
  for (const pr of (data.providers || [])) {
    const cls = `ls-status-${pr.status}`;
    html += `<div class="ls-row">
      <span class="ls-icon ${cls}">${STATUS_ICONS[pr.status] || '?'}</span>
      <span class="ls-name">${pr.name}</span>
      <span class="ls-badge ${cls}">${STATUS_LABELS[pr.status] || pr.status.toUpperCase()}</span>
      <span class="ls-note">${pr.note || ''}</span>
    </div>`;
  }
  html += '</div>';

  html += '</div>';
  body.innerHTML = html;
}

async function loadStatus() {
  try {
    const res = await fetch(`/status.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    renderStatus(data);
    // Refresh display every minute (file updates every 30m)
    setInterval(() => {
      const upd = document.getElementById('liveStatusUpdated');
      if (upd && window._statusData) upd.textContent = `updated ${timeAgo(window._statusData.updated)}`;
    }, 60000);
    window._statusData = data;
  } catch(e) {
    const body = document.getElementById('liveStatusBody');
    if (body) body.innerHTML = '<div class="live-status-loading">status unavailable</div>';
  }
}

// Load after boot so it doesn't block the page
window.addEventListener('load', () => setTimeout(loadStatus, 1200));

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
