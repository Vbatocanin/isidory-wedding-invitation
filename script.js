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

  // ---- Smoothly sweep progressY to a target (drives the reveal both ways) ----
  var animToken = 0;
  function animateProgress(targetY, duration, onDone) {
    var myToken = ++animToken;   // cancels any in-flight animation
    var startY  = progressY;
    var diff    = targetY - startY;
    var startT  = null;

    function step(ts) {
      if (myToken !== animToken) return;   // superseded by a newer animation
      if (!startT) startT = ts;
      var t = clamp((ts - startT) / duration, 0, 1);
      progressY = startY + diff * easeInOutCubic(t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (onDone) {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  // ---- Detect the *first* scroll gesture, play the reveal once, then stop ----
  var intentEvents = ['wheel', 'touchmove', 'keydown'];
  var historyPushed = false;

  function addIntentListeners() {
    intentEvents.forEach(function (evt) {
      window.addEventListener(evt, onIntent, { passive: true });
    });
  }
  function removeIntentListeners() {
    intentEvents.forEach(function (evt) {
      window.removeEventListener(evt, onIntent);
    });
  }

  function reveal(duration) {
    if (revealed) return;
    revealed = true;
    clearTimeout(idleTimer);
    removeIntentListeners();
    addBackListeners();          // now allow a swipe-up to return to the gallery
    startMusic();
    // Add a history entry so a phone "back" swipe scrolls us back to the top
    // (popstate) instead of leaving the invitation.
    if (!historyPushed) {
      historyPushed = true;
      try { history.pushState({ inv: true }, ''); } catch (e) {}
    }
    animateProgress(SCROLL_RANGE, duration);
  }

  // ---- Back gesture: reverse the reveal, returning to the top (gallery) ----
  function backToTop(duration) {
    if (!revealed) return;
    revealed = false;
    removeBackListeners();
    galleryScreen.style.visibility = 'visible';
    animateProgress(0, duration, function () {
      // Ready to be revealed again from the top
      goingBack = false;
      addIntentListeners();
      idleTimer = setTimeout(function () { reveal(3500); }, 10000);
    });
  }

  // Swiping up (or scrolling / arrow-up) on the invitation takes us back to the
  // gallery. Route through history.back() when we pushed an entry so the
  // browser history stays in sync; otherwise reverse directly.
  var goingBack = false;
  function triggerBack() {
    if (!revealed || goingBack) return;
    goingBack = true;
    if (historyPushed) {
      history.back();            // fires the popstate handler → backToTop
    } else {
      backToTop(1400);
    }
  }

  // ---- Swipe-up-to-gallery listeners (active only while the invitation shows) ----
  var backEvents  = ['wheel', 'touchstart', 'touchmove', 'keydown'];
  var backTouchY  = 0;
  function onBackIntent(e) {
    if (!revealed) return;
    switch (e.type) {
      case 'touchstart':
        backTouchY = e.touches[0].clientY;
        break;
      case 'touchmove':
        // finger travelling upward (start higher value → smaller) = swipe up
        if (backTouchY - e.touches[0].clientY > 45) triggerBack();
        break;
      case 'wheel':
        if (e.deltaY < 0) triggerBack();          // scrolling up
        break;
      case 'keydown':
        if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') triggerBack();
        break;
    }
  }
  function addBackListeners() {
    backEvents.forEach(function (evt) {
      window.addEventListener(evt, onBackIntent, { passive: true });
    });
  }
  function removeBackListeners() {
    backEvents.forEach(function (evt) {
      window.removeEventListener(evt, onBackIntent);
    });
  }

  window.addEventListener('popstate', function () {
    historyPushed = false;     // the entry we pushed has been consumed
    backToTop(1400);
  });

  function onIntent() { reveal(2600); }

  addIntentListeners();

  // Tapping the hint plays the reveal a touch quicker
  scrollHint.addEventListener('click', function () { reveal(1600); });

  // If the guest never scrolls, gently reveal on its own after 10 s
  idleTimer = setTimeout(function () { reveal(3500); }, 10000);

  // ---- Music ----------------------------------------------------------------
  // We want the song to start as early as possible. Browsers block autoplay
  // until a genuine user gesture, and crucially iOS Safari only counts
  // *discrete* gestures — touchstart / touchend / click / keydown — NOT the
  // continuous `touchmove` of a swipe. So unlocking on touchmove (the scroll
  // that drives the reveal) silently fails on iPhone, while the toggle button
  // tap works. We therefore arm a dedicated set of unlock listeners that fire
  // on the *start* of any interaction, independent of the reveal animation.
  function startMusic() {
    musicToggle.hidden = false;
    var attempt = song.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(function () {
        musicStarted = true;
      }).catch(function () {
        // Blocked (no qualifying gesture yet) — a real tap will retry below.
        musicStarted = false;
        setPlayingUI(false);
      });
    } else {
      musicStarted = true;
    }
  }

  // Gestures iOS accepts as audio-unlocking. `touchstart` fires at the very
  // beginning of a swipe, so the same swipe that reveals the page also starts
  // the music.
  var unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown'];
  function armUnlock() {
    unlockEvents.forEach(function (evt) {
      window.addEventListener(evt, onUnlock, { passive: true });
    });
  }
  function disarmUnlock() {
    unlockEvents.forEach(function (evt) {
      window.removeEventListener(evt, onUnlock);
    });
  }
  function onUnlock() {
    startMusic();
    // play() flips `paused` to false synchronously when it's accepted, so this
    // reliably tells us the gesture unlocked playback.
    if (!song.paused) disarmUnlock();
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

  // iOS often restores the page from its back/forward cache when the guest
  // navigates back to it. The <audio> element comes back in a stale, paused
  // state, so playback "doesn't work on revisit". Detect that restore and
  // re-arm everything so the next tap/swipe starts the song again.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      musicStarted = false;
      setPlayingUI(false);
      startMusic();          // try to resume straight away
      armUnlock();           // …and fall back to the next gesture if blocked
    }
  });

  // ---- Boot ----
  computeScrollRange();
  applyInitialState();
  requestAnimationFrame(loop);

  // Try to play the moment the page opens; most browsers will block this until
  // a gesture, so we also arm the unlock listeners as a fallback. Either way
  // the music starts as early as the browser allows.
  setPlayingUI(false);
  startMusic();
  armUnlock();

  window.addEventListener('resize', function () {
    computeScrollRange();
    if (revealed) {
      progressY = SCROLL_RANGE;   // keep the invitation fully shown after a resize
    } else {
      applyInitialState();
    }
  }, { passive: true });
}());
