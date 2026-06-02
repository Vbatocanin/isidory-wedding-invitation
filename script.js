// Wedding invitation — entry + music control
(function () {
  "use strict";

  var enterScreen = document.getElementById("enter-screen");
  var invitation = document.getElementById("invitation");
  var song = document.getElementById("song");
  var toggle = document.getElementById("music-toggle");

  var entered = false;

  function reveal() {
    if (entered) return;
    entered = true;

    enterScreen.classList.add("hidden");
    invitation.classList.add("revealed");
    invitation.setAttribute("aria-hidden", "false");

    // Start the song. The tap on the overlay is the user gesture that
    // browsers require before audio with sound is allowed to play.
    play();

    toggle.hidden = false;

    // Remove the overlay from the layout once it has faded out.
    window.setTimeout(function () {
      if (enterScreen && enterScreen.parentNode) {
        enterScreen.style.display = "none";
      }
    }, 1200);
  }

  function play() {
    var attempt = song.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        // Autoplay still blocked, or no audio file present — show paused.
        setPlayingUI(false);
      });
    }
  }

  function setPlayingUI(isPlaying) {
    toggle.classList.toggle("playing", isPlaying);
    toggle.classList.toggle("paused", !isPlaying);
    toggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
  }

  // Enter on tap / click / keyboard.
  enterScreen.addEventListener("click", reveal);
  document.addEventListener("keydown", function (e) {
    if (!entered && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      reveal();
    }
  });

  // Music toggle button.
  toggle.addEventListener("click", function () {
    if (song.paused) {
      play();
    } else {
      song.pause();
    }
  });

  // Keep the icon in sync with actual playback state.
  song.addEventListener("play", function () { setPlayingUI(true); });
  song.addEventListener("pause", function () { setPlayingUI(false); });

  // ---------- Details & RSVP panel ----------
  var detailsOverlay = document.getElementById("details");
  var detailsOpen = document.getElementById("details-open");
  var detailsClose = document.getElementById("details-close");

  function openDetails() {
    detailsOverlay.hidden = false;
    // next frame so the CSS transition runs
    requestAnimationFrame(function () {
      detailsOverlay.classList.add("open");
    });
  }

  function closeDetails() {
    detailsOverlay.classList.remove("open");
    window.setTimeout(function () {
      detailsOverlay.hidden = true;
    }, 350);
  }

  detailsOpen.addEventListener("click", openDetails);
  detailsClose.addEventListener("click", closeDetails);

  // Close on backdrop click or Escape.
  detailsOverlay.addEventListener("click", function (e) {
    if (e.target === detailsOverlay) closeDetails();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !detailsOverlay.hidden) closeDetails();
  });
})();
