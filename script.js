// Wedding invitation — scroll-driven parallax gallery
(function () {
  'use strict';

  var scroller      = document.getElementById('scroller');
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
  var lastScrollY   = -1;
  var musicStarted  = false;
  var autoScrolling = false;
  var autoTimer     = null;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function computeScrollRange() {
    SCROLL_RANGE = scroller.scrollHeight - scroller.clientHeight;
  }

  function getScrollY() {
    return scroller.scrollTop;
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

  // ---- Main render ----
  function render() {
    var scrollY = getScrollY();

    if (scrollY === lastScrollY) return;
    lastScrollY = scrollY;

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
    // Starts animating at 15% scroll progress, completes at 100%
    var invP  = clamp((progress - 0.15) / 0.85, 0, 1);
    var eased = easeInOutCubic(invP);

    var scale = 0.18 + eased * 0.82;         // 0.18 → 1 (grows from centre)

    invPanel.style.transform = 'scale(' + scale + ')';
    invPanel.style.opacity   = String(clamp(invP / 0.25, 0, 1));
    invPanel.setAttribute('aria-hidden', invP > 0.05 ? 'false' : 'true');

    // --- Scroll hint: fades out as soon as scrolling begins ---
    scrollHint.style.opacity = String(1 - clamp(progress / 0.08, 0, 1));

    // Hide gallery underneath when fully covered (saves paint)
    galleryScreen.style.visibility = invP > 0.98 ? 'hidden' : 'visible';
  }

  // ---- RAF loop ----
  function loop() {
    render();
    requestAnimationFrame(loop);
  }

  // ---- Auto-scroll: kicks in after 10 s of no user interaction ----
  function smoothScrollTo(target, duration, done) {
    var startY = getScrollY();
    var diff   = target - startY;
    var startT = null;

    function step(ts) {
      if (!startT) startT = ts;
      var t = clamp((ts - startT) / duration, 0, 1);
      scroller.scrollTop = startY + diff * easeInOutCubic(t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (typeof done === 'function') {
        done();
      }
    }
    requestAnimationFrame(step);
  }

  // Idle timer: 10 s after the last genuine interaction (and only while still
  // near the top), gently auto-scroll to the invitation.
  function scheduleAutoScroll() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () {
      var atTop = getScrollY() < SCROLL_RANGE * 0.05;
      if (!autoScrolling && atTop) {
        autoScrolling = true;
        smoothScrollTo(SCROLL_RANGE, 3500, function () { autoScrolling = false; });
      }
    }, 10000);
  }

  // ---- Music: start on the very first user gesture ----
  // Browsers block autoplay until the user interacts, so we kick the song off
  // on the first scroll/tap/key — i.e. as soon as someone starts scrolling.
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    musicToggle.hidden = false;
    var attempt = song.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        // Playback was blocked — let the user try again on the next gesture.
        musicStarted = false;
        setPlayingUI(false);
      });
    }
  }

  function registerInteraction() {
    startMusic();
    // Ignore scroll events produced by our own programmatic auto-scroll
    if (autoScrolling) return;
    scheduleAutoScroll();
  }

  // Clicking the hint scrolls straight to the invitation
  scrollHint.addEventListener('click', function () {
    clearTimeout(autoTimer);
    autoScrolling = true;
    smoothScrollTo(SCROLL_RANGE, 1800, function () { autoScrolling = false; });
  });

  // Scroll/pointer gestures happen on the scroller; keydown stays on window.
  ['touchstart', 'mousedown', 'wheel'].forEach(function (evt) {
    scroller.addEventListener(evt, registerInteraction, { passive: true });
  });
  window.addEventListener('keydown', registerInteraction, { passive: true });

  // ---- Hard overscroll lock ----
  // CSS overscroll-behavior isn't honoured everywhere (some Android Chrome
  // builds still rubber-band / pull-to-refresh). This physically cancels any
  // drag that would push past the top or bottom, so overscroll can't happen
  // regardless of browser support. Non-passive so preventDefault works.
  var touchStartY = 0;
  scroller.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  scroller.addEventListener('touchmove', function (e) {
    var dy       = e.touches[0].clientY - touchStartY; // >0 = finger down = scroll up
    var atTop    = scroller.scrollTop <= 0;
    var atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if ((atTop && dy > 0) || (atBottom && dy < 0)) {
      e.preventDefault();
    }
  }, { passive: false });

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
  scheduleAutoScroll();

  window.addEventListener('resize', function () {
    computeScrollRange();
    applyInitialState();
  }, { passive: true });
}());
