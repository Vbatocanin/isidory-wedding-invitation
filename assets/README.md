# Assets — add your photo and the song here

This folder holds the two files that make the invitation personal. Both are
intentionally **not** committed to the repo (a photo is private, and the song
is copyrighted), so you drop them in yourself.

## 1. The hero photo → `hero.jpg`

Place your photo here and name it exactly `hero.jpg`.

- Any web image format works if you keep the `.jpg` name, but a real JPEG/PNG
  is best. A **portrait** orientation around **1000 × 1400 px** or larger looks
  great, since the photo fills the whole page.
- Until you add it, a gold-framed placeholder (`hero-placeholder.svg`) is shown
  automatically — nothing breaks.

## 2. The song → `felicita.mp3`

The page plays **“Felicità” by Al Bano & Romina Power** when a visitor taps to
enter. Add the audio file here, named exactly `felicita.mp3`.

- We can't ship the audio file because the song is copyrighted — you need to
  supply a copy you have the right to use.
- MP3 is the safest format for browser playback. If you only have another
  format (e.g. `.m4a`/`.ogg`), either convert it to MP3 or update the
  `<audio src="...">` line in `index.html` to match.
- If the file is missing, the page still works — it just opens silently, and
  the music button shows the paused state.

### Prefer not to host the MP3 yourself?

You can swap the `<audio>` element in `index.html` for a hidden YouTube embed
of the official video. Tell me and I'll wire that up instead — note that
YouTube shows ads and is a little less reliable for "instant" playback.
