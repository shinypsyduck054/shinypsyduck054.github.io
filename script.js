// Cursor glow effect
const glow = document.getElementById('cursorGlow');
let glowVisible = false;

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
  if (!glowVisible) {
    glow.style.opacity = '1';
    glowVisible = true;
  }
});

document.addEventListener('mouseleave', () => {
  glow.style.opacity = '0';
  glowVisible = false;
});

// Intersection observer for fade-up animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Add fade-up to all animatable elements
const animTargets = document.querySelectorAll(
  '.card, .about-text, .about-facts, .fact, .contact-inner, .section-header'
);
animTargets.forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${i * 0.04}s`;
  observer.observe(el);
});

// Smooth active nav link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = '#fcd34d';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => navObserver.observe(section));

// Easter egg — Psyduck rave mode
let clicks = 0;
const orb = document.querySelector('.psyduck-orb');
if (orb) {
  orb.addEventListener('click', () => {
    clicks++;
    if (clicks >= 5) {
      document.body.style.transition = 'filter 0.3s';
      document.body.style.filter = 'hue-rotate(360deg)';
      orb.style.fontSize = '12rem';
      orb.textContent = '🕺🐥🕺';
      setTimeout(() => {
        document.body.style.filter = '';
        orb.style.fontSize = '';
        orb.textContent = '🐥';
        clicks = 0;
      }, 2000);
    }
  });
}

console.log('%c🐥 hey, you found the console.', 'color: #fcd34d; font-size: 16px; font-weight: bold;');
console.log('%cbuilt by justin · powered by psyduck', 'color: #888; font-size: 12px;');
