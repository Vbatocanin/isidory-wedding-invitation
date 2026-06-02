# Wedding Invitation

A single-page wedding invitation: a full-screen hero photo framed by a slim
header and footer, with **“Felicità” by Al Bano & Romina Power** playing when a
visitor taps to enter. A **Details & RSVP** panel holds the event info and
links out to your RSVP form.

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
| Names | `index.html` — the `Isidora & Vlad` spots |
| Date & place | `index.html` — `.footer-date` and `.footer-place` |
| Event details | `index.html` — the `.details-grid` section (when / where / dress code / reply-by) |
| RSVP form | `index.html` — the RSVP button's `href` (search `REPLACE_WITH_YOUR_FORM`) |

> All names, dates, places, and details in `index.html` are placeholders —
> edit them to your details.

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
opens with a **“Tap to open the invitation”** screen. That tap is the user
gesture browsers require, and it both reveals the photo and starts the song.
A small button in the corner lets visitors pause or resume the music.

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
