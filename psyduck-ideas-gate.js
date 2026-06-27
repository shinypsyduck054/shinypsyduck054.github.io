// PSYDUCK ideas access gate. Client-side PIN. Retro 4-box entry.
// Session-scoped: PIN asked once per browser session.
(function () {
  if (sessionStorage.getItem('psyduck-ideas-access') === '0045') return;

  var style = document.createElement('style');
  style.textContent =
    '#psyduck-ideas-gate{position:fixed;inset:0;background:#0a0e27;z-index:99999;' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-family:"VT323","Press Start 2P",monospace;color:#34d399;}' +
    '.psyduck-pin-digit{width:68px;height:84px;background:transparent;' +
    'border:2px solid #34d399;color:#34d399;font-size:40px;font-weight:700;' +
    'text-align:center;font-family:"VT323",monospace;outline:none;border-radius:4px;' +
    'caret-color:#06b6d4;' +
    'transition:border-color 0.15s,background 0.15s,transform 0.1s;box-shadow:0 0 8px rgba(52,211,153,0.2);}' +
    '.psyduck-pin-digit:focus{border-color:#06b6d4;background:rgba(52,211,153,0.1);box-shadow:0 0 16px rgba(52,211,153,0.4);}' +
    '.psyduck-pin-digit.filled{background:rgba(52,211,153,0.08);}' +
    '.psyduck-pin-digit.wrong{border-color:#f87171;background:rgba(248,113,113,0.22);' +
    'animation:psyduckShake 0.4s;}' +
    '@keyframes psyduckShake{0%,100%{transform:translateX(0);}' +
    '20%,60%{transform:translateX(-6px);}40%,80%{transform:translateX(6px);}}' +
    '@media(max-width:500px){' +
    '.psyduck-pin-digit{width:54px;height:70px;font-size:30px;}' +
    '#psyduck-pin-boxes{gap:10px !important;}}';
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.id = 'psyduck-ideas-gate';
  overlay.innerHTML =
    '<div style="text-align:center;padding:40px;max-width:520px;width:90%;font-family:\'VT323\',monospace;">' +
    '<div style="font-size:32px;letter-spacing:0.08em;line-height:1;margin-bottom:8px;color:#34d399;">[ IDEAS ]</div>' +
    '<div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;opacity:0.7;color:#60a5fa;">psyduck · inner circle only</div>' +
    '<form id="psyduck-pin-form" autocomplete="off">' +
    '<div id="psyduck-pin-boxes" style="display:flex;justify-content:center;gap:14px;margin-bottom:18px;">' +
    '<input class="psyduck-pin-digit" type="text" inputmode="numeric" maxlength="1" data-i="0" aria-label="PIN digit 1" />' +
    '<input class="psyduck-pin-digit" type="text" inputmode="numeric" maxlength="1" data-i="1" aria-label="PIN digit 2" />' +
    '<input class="psyduck-pin-digit" type="text" inputmode="numeric" maxlength="1" data-i="2" aria-label="PIN digit 3" />' +
    '<input class="psyduck-pin-digit" type="text" inputmode="numeric" maxlength="1" data-i="3" aria-label="PIN digit 4" />' +
    '</div>' +
    '<div id="psyduck-pin-error" style="font-size:11px;color:#fca5a5;letter-spacing:0.15em;text-transform:uppercase;min-height:14px;opacity:0;transition:opacity 0.15s;">nope</div>' +
    '</form>' +
    '<div style="margin-top:32px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.5;color:#60a5fa;">' +
    '<a href="/" style="color:inherit;text-decoration:underline;">back to home</a>' +
    '</div>' +
    '</div>';

  function attach() {
    document.body.appendChild(overlay);
    var inputs = overlay.querySelectorAll('.psyduck-pin-digit');
    var err = overlay.querySelector('#psyduck-pin-error');
    var form = overlay.querySelector('#psyduck-pin-form');

    setTimeout(function () { inputs[0].focus(); }, 80);

    function getValue() {
      var v = '';
      for (var k = 0; k < inputs.length; k++) v += inputs[k].value;
      return v;
    }

    function clearAll() {
      for (var k = 0; k < inputs.length; k++) {
        inputs[k].value = '';
        inputs[k].classList.remove('filled');
      }
    }

    function tryUnlock() {
      var pin = getValue();
      if (pin.length !== 4) return;
      if (pin === '0045') {
        sessionStorage.setItem('psyduck-ideas-access', '0045');
        overlay.remove();
      } else {
        for (var k = 0; k < inputs.length; k++) inputs[k].classList.add('wrong');
        err.style.opacity = '1';
        setTimeout(function () {
          for (var k = 0; k < inputs.length; k++) inputs[k].classList.remove('wrong');
          clearAll();
          inputs[0].focus();
        }, 500);
      }
    }

    function bindInput(inp, i) {
      inp.addEventListener('input', function () {
        var v = inp.value.replace(/[^0-9]/g, '');
        inp.value = v.slice(0, 1);
        err.style.opacity = '0';
        if (inp.value) inp.classList.add('filled');
        else inp.classList.remove('filled');
        if (inp.value && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
        if (i === inputs.length - 1 && inp.value) {
          tryUnlock();
        }
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
          inputs[i - 1].focus();
          inputs[i - 1].value = '';
          inputs[i - 1].classList.remove('filled');
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' && i > 0) {
          inputs[i - 1].focus();
          e.preventDefault();
        } else if (e.key === 'ArrowRight' && i < inputs.length - 1) {
          inputs[i + 1].focus();
          e.preventDefault();
        } else if (e.key === 'Enter') {
          tryUnlock();
          e.preventDefault();
        }
      });
      inp.addEventListener('paste', function (e) {
        e.preventDefault();
        var paste = (e.clipboardData || window.clipboardData).getData('text');
        var digits = paste.replace(/[^0-9]/g, '').slice(0, 4);
        for (var j = 0; j < digits.length && j < inputs.length; j++) {
          inputs[j].value = digits[j];
          inputs[j].classList.add('filled');
        }
        if (digits.length === 4) {
          tryUnlock();
        } else if (digits.length > 0) {
          inputs[Math.min(digits.length, inputs.length - 1)].focus();
        }
      });
      inp.addEventListener('focus', function () { inp.select(); });
    }

    for (var i = 0; i < inputs.length; i++) bindInput(inputs[i], i);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tryUnlock();
    });
  }

  if (document.body) {
    attach();
  } else {
    document.addEventListener('DOMContentLoaded', attach);
  }
})();
