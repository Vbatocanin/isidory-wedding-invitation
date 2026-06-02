# Assets

| File | What it is |
| --- | --- |
| `hero.png` | the couple's photo (cropped from the invitation you sent) |
| `corner.svg` | the gold botanical corner ornament (used in all four corners) |
| `hero-placeholder.svg` | fallback shown only if `hero.png` is missing |
| `felicita.mp3` | **you add this** — the song (copyrighted, see below) |

## The hero photo → `hero.png`

This is already set to the couple's photo. To change it, replace `hero.png`
with another image of the same name.

- A **portrait** orientation (taller than wide) looks best in the frame; the
  page applies a black-and-white filter automatically to match the card.
- If the file is ever missing, the gold-framed `hero-placeholder.svg` shows
  instead — nothing breaks.

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
