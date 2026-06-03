// Wedding invitation — one-shot reveal
// The page never scrolls. The first scroll gesture (wheel / touch drag / key)
// plays the whole parallax-and-zoom reveal smoothly, then we stop listening.
// With nothing scrollable, overscroll / rubber-band / pull-to-refresh can't happen.
(function () {
  'use strict';

  var galleryScreen = document.getElementById('gallery-screen');
  var invPanel      = document.getElementById('invitation-panel');
  var scrollHint    = document.getElementById('scroll-hint');
  var photos        = document.querySelectorAll('.photo-item');
  var song          = document.getElementById('song');
  var musicToggle   = document.getElementById('music-toggle');

  // depth: 0 = far (slow, disappears last), 1 = close (fast, disappears first)
  // bigger spread between depths = more pronounced parallax separation
  var configs = [
    { depth: 0.12 },  // photo-0 farthest
    { depth: 0.45 },  // photo-1
    { depth: 0.78 },  // photo-2
    { depth: 1.15 },  // photo-3 closest
  ];

  var SCROLL_RANGE  = 0;
  var progressY     = 0;     // virtual scroll position (0 → SCROLL_RANGE) driving the animation
  var lastRendered  = -1;
  var revealed      = false; // the one-shot reveal has fired
  var musicStarted  = false;
  var idleTimer     = null;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function computeScrollRange() {
    // ~1.2 screen-heights of travel — matches the old 220vh body sweep
    SCROLL_RANGE = window.innerHeight * 1.2;
  }

  // ---- Initial state ----
  function applyInitialState() {
    for (var i = 0; i < photos.length; i++) {
      photos[i].style.transform = 'translateY(0px)';
      photos[i].style.opacity = '1';
    }
    invPanel.style.transform = 'scale(0.18)';
    invPanel.style.opacity   = '0';
  }

  // ---- Main render (driven by progressY, not real scroll) ----
  function render() {
    if (progressY === lastRendered) return;
    lastRendered = progressY;

    var scrollY  = progressY;
    var progress = clamp(scrollY / SCROLL_RANGE, 0, 1);

    // --- Photos: depth-based parallax + staggered fade ---
    for (var i = 0; i < photos.length; i++) {
      var c      = configs[i];
      // Close photos move much faster — wide speed spread for strong parallax
      var speed  = 0.2 + c.depth * 1.9;
      var ty     = -scrollY * speed;

      // Close photos start fading sooner; far photos linger
      var fadeS  = (1.15 - c.depth) * 0.2;
      var fadeE  = fadeS + 0.34;
      var opac   = 1 - clamp((progress - fadeS) / (fadeE - fadeS), 0, 1);

      photos[i].style.transform = 'translateY(' + ty + 'px)';
      photos[i].style.opacity = opac;
    }

    // --- Invitation panel: zooms in from the centre ---
    // Starts animating at 15% progress, completes at 100%
    var invP  = clamp((progress - 0.15) / 0.85, 0, 1);
    var eased = easeInOutCubic(invP);

    var scale = 0.18 + eased * 0.82;         // 0.18 → 1 (grows from centre)

    invPanel.style.transform = 'scale(' + scale + ')';
    invPanel.style.opacity   = String(clamp(invP / 0.25, 0, 1));
    invPanel.setAttribute('aria-hidden', invP > 0.05 ? 'false' : 'true');

    // --- Scroll hint: fades out as soon as the reveal begins ---
    scrollHint.style.opacity = String(1 - clamp(progress / 0.08, 0, 1));

    // Hide gallery underneath when fully covered (saves paint)
    galleryScreen.style.visibility = invP > 0.98 ? 'hidden' : 'visible';
  }

  // ---- RAF loop ----
  function loop() {
    render();
    requestAnimationFrame(loop);
  }

  // ---- The reveal: smoothly sweep progressY from 0 → SCROLL_RANGE ----
  function animateReveal(duration) {
    var startY = progressY;
    var diff   = SCROLL_RANGE - startY;
    var startT = null;

    function step(ts) {
      if (!startT) startT = ts;
      var t = clamp((ts - startT) / duration, 0, 1);
      progressY = startY + diff * easeInOutCubic(t);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- Detect the *first* scroll gesture, play the reveal once, then stop ----
  var intentEvents = ['wheel', 'touchmove', 'keydown'];

  function reveal(duration) {
    if (revealed) return;
    revealed = true;
    clearTimeout(idleTimer);
    intentEvents.forEach(function (evt) {
      window.removeEventListener(evt, onIntent);
    });
    startMusic();
    animateReveal(duration);
  }

  function onIntent() { reveal(2600); }

  intentEvents.forEach(function (evt) {
    window.addEventListener(evt, onIntent, { passive: true });
  });

  // Tapping the hint plays the reveal a touch quicker
  scrollHint.addEventListener('click', function () { reveal(1600); });

  // If the guest never scrolls, gently reveal on its own after 10 s
  idleTimer = setTimeout(function () { reveal(3500); }, 10000);

  // ---- Music: starts on the same first gesture that triggers the reveal ----
  // Browsers block autoplay until the user interacts, so we kick the song off
  // on that first scroll/tap/key.
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    musicToggle.hidden = false;
    var attempt = song.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        // Playback was blocked — let the user start it from the toggle.
        musicStarted = false;
        setPlayingUI(false);
      });
    }
  }

  // ---- Music toggle ----
  function setPlayingUI(isPlaying) {
    musicToggle.classList.toggle('playing', isPlaying);
    musicToggle.classList.toggle('paused', !isPlaying);
    musicToggle.setAttribute('aria-label', isPlaying ? 'Pauziraj muziku' : 'Pusti muziku');
  }

  musicToggle.addEventListener('click', function () {
    if (song.paused) {
      song.play().catch(function () {});
    } else {
      song.pause();
    }
  });

  song.addEventListener('play',  function () { setPlayingUI(true); });
  song.addEventListener('pause', function () { setPlayingUI(false); });

  // ---- Boot ----
  computeScrollRange();
  applyInitialState();
  requestAnimationFrame(loop);

  window.addEventListener('resize', function () {
    computeScrollRange();
    if (revealed) {
      progressY = SCROLL_RANGE;   // keep the invitation fully shown after a resize
    } else {
      applyInitialState();
    }
  }, { passive: true });
}());
