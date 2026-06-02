# Isidora & Nebojša — Wedding Invitation

A single-page wedding invitation for **Isidora & Nebojša** (04.10.2026), built
to match the printed card: warm cream paper, gold botanical corners, the
couple's photo centred in a soft frame, the calligraphy names, and the schedule
and RSVP below. **“Felicità” by Al Bano & Romina Power** plays when a visitor
taps to enter, and an RSVP button links out to a Google Form.

Fonts: **Pinyon Script** for the names and **Cormorant Garamond** for
everything else (both loaded from Google Fonts, with the Latin-Extended subset
so Serbian diacritics like *š* render correctly). The gold corner ornaments
live in `assets/corner.svg`.

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
| The photo | `assets/hero.png` (already set to the couple's photo; replace to change) |
| The song | add `assets/felicita.mp3` (see `assets/README.md`) |
| Date | `index.html` — the `.date` line (`04.10.2026.`) |
| Names | `index.html` — the `.names` and `.enter-names` headings |
| Schedule | `index.html` — the three `.schedule` lines (14h / 16h / 16.30h) |
| RSVP deadline | `index.html` — the `.rsvp-note` line |
| RSVP form | `index.html` — the RSVP button's `href` (search `REPLACE_WITH_YOUR_FORM`) |

## RSVP (Google Form)

Guests RSVP through a Google Form you own — responses collect automatically in
a Google Sheet.

1. Create the form at <https://forms.google.com> (e.g. fields for name, number
   of guests, attending yes/no, dietary notes, a message).
2. Click **Send → link** (the `🔗` tab) and copy the share link — it looks like
   `https://forms.gle/AbC123…`.
3. In `index.html`, replace `https://forms.gle/REPLACE_WITH_YOUR_FORM` on the
   RSVP button with that link.

## How the music works

Browsers block audio with sound from auto-playing on page load, so the page
opens with a **“Dodirnite da otvorite pozivnicu”** (tap to open) screen. That
tap is the user gesture browsers require, and it both reveals the card and
starts the song. A small button in the corner lets visitors pause or resume the
music. Add the audio as `assets/felicita.mp3` — without it the page still opens,
just silently.

## Hosting (free) — GitHub Pages project site

This publishes to **`https://vbatocanin.github.io/isidory-wedding-invitation/`**,
which is a *project* site — completely separate from your user site
(`vbatocanin.github.io`), so it does **not** affect your CV page.

A deploy workflow is included at `.github/workflows/deploy-pages.yml`. To turn
it on (one time):

1. Merge this PR to `main`.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and
   choose **GitHub Actions**.
3. Every push to `main` then republishes automatically. The live URL appears
   under the **Deploy to GitHub Pages** action and in Settings → Pages.

Because the page uses relative asset paths, it works correctly under the
`/isidory-wedding-invitation/` sub-path with no extra configuration.
