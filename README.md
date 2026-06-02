# Wedding Invitation

A single-page wedding invitation: a full-screen hero photo framed by a slim
header and footer, with **“Felicità” by Al Bano & Romina Power** playing when a
visitor taps to enter.

## Run it

It's a static site — no build step. Either open `index.html` directly, or
serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Make it yours

| What | Where |
| --- | --- |
| Your photo | add `assets/hero.jpg` (see `assets/README.md`) |
| The song | add `assets/felicita.mp3` (see `assets/README.md`) |
| Names | `index.html` — the two `Isidora & Vlad` spots |
| Date & place | `index.html` — `.footer-date` and `.footer-place` |

> The names, date, and place in `index.html` are placeholders — edit them to
> your details.

## How the music works

Browsers block audio with sound from auto-playing on page load, so the page
opens with a **“Tap to open the invitation”** screen. That tap is the user
gesture browsers require, and it both reveals the photo and starts the song.
A small button in the corner lets visitors pause or resume the music.
