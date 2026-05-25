// ===========================
// BOOT SEQUENCE
// ===========================
const bootLines = [
  'PSYDUCK OS v1.0 [SHINY EDITION]',
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

const bootScreen = document.getElementById('bootScreen');
const bootTextEl = document.getElementById('bootText');
const mainContent = document.getElementById('mainContent');

let lineIdx = 0;
let charIdx = 0;
let bootDone = false;
let currentText = '';

function typeBoot() {
  if (lineIdx >= bootLines.length) {
    finishBoot();
    return;
  }

  const line = bootLines[lineIdx];

  if (charIdx < line.length) {
    currentText += line[charIdx];
    bootTextEl.textContent = currentText;
    charIdx++;
    setTimeout(typeBoot, 18);
  } else {
    currentText += '\n';
    bootTextEl.textContent = currentText;
    lineIdx++;
    charIdx = 0;
    // Faster between lines
    const delay = line === '' ? 50 : 80;
    setTimeout(typeBoot, delay);
  }
}

function finishBoot() {
  bootDone = true;
  setTimeout(() => {
    bootScreen.classList.add('hidden');
    mainContent.classList.add('visible');
    startTypewriter();
  }, 600);
}

// Skip boot on any key or click
function skipBoot() {
  if (!bootDone) {
    bootDone = true;
    bootScreen.classList.add('hidden');
    mainContent.classList.add('visible');
    startTypewriter();
  }
}

document.addEventListener('keydown', skipBoot);
document.addEventListener('click', skipBoot);

// Start booting
setTimeout(typeBoot, 400);

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
];

let taglineIdx = 0;
let taglineChar = 0;
let erasing = false;
let typeActive = false;
const typeEl = document.getElementById('typeText');

function startTypewriter() {
  typeActive = true;
  typewriterTick();
}

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
// UPTIME COUNTER
// ===========================
const uptimeEl = document.getElementById('uptime');
const startTime = Date.now();

function updateUptime() {
  if (!uptimeEl) return;
  const ms = Date.now() - startTime;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);

  let str = '';
  if (days > 0) str += `${days}d `;
  str += `${String(h % 24).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  uptimeEl.textContent = str + ' (this session)';
}

setInterval(updateUptime, 1000);
updateUptime();

// ===========================
// STAT BARS ANIMATION
// (triggered on scroll)
// ===========================
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-fill').forEach((fill, i) => {
        fill.style.animationDelay = `${i * 0.15}s`;
      });
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats-card').forEach(el => statObserver.observe(el));

// ===========================
// DUCK EASTER EGG
// Click the hero duck 7 times → full rave mode
// ===========================
let duckClicks = 0;
const titleDuck = document.querySelector('.title-duck');

if (titleDuck) {
  titleDuck.style.cursor = 'pointer';
  titleDuck.addEventListener('click', (e) => {
    e.stopPropagation(); // don't trigger boot skip
    duckClicks++;

    if (duckClicks === 3) {
      titleDuck.textContent = '🤯';
      setTimeout(() => { titleDuck.textContent = '🐥'; }, 800);
    }

    if (duckClicks >= 7) {
      document.body.style.transition = 'filter 0.2s';
      let hue = 0;
      const rave = setInterval(() => {
        hue = (hue + 30) % 360;
        document.body.style.filter = `hue-rotate(${hue}deg) saturate(1.5)`;
      }, 100);

      titleDuck.textContent = '🕺🐥🕺';
      titleDuck.style.fontSize = '10rem';

      setTimeout(() => {
        clearInterval(rave);
        document.body.style.filter = '';
        titleDuck.textContent = '🐥';
        titleDuck.style.fontSize = '';
        duckClicks = 0;
      }, 3000);
    }
  });
}

// ===========================
// CONSOLE MESSAGE
// ===========================
console.log('%c🐥 PSYDUCK OPERATIONAL', 'color: #fcd34d; font-family: monospace; font-size: 18px; font-weight: bold;');
console.log('%c >> Try clicking the duck a few times.', 'color: #00d4ff; font-family: monospace; font-size: 12px;');
console.log('%c >> github.com/shinypsyduck054', 'color: #6a9ab8; font-family: monospace; font-size: 11px;');
