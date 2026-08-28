# Static Website Starter Template

A clean, minimalist template for building modern static HTML, CSS, and JavaScript websites without frameworks or build steps.

## Features & Characteristics

- **Responsive Layout**: Designed for seamless display across mobile, tablet, and desktop viewports.
- **Top Header & Navigation**: Clean top header with site title and icon-only light/dark theme switcher, paired with a snappy navigation bar.
- **Dynamic Mobile Menu**: Clean inline navigation on mobile for compact menus ($\le 3$ items), automatically switching to an accessible hamburger menu for $4+$ pages.
- **Light / Dark Mode**: Built-in theme switcher with sleek SVG icons, supporting user preference persistence via `localStorage` and system `prefers-color-scheme`.
- **Fixed Bottom Footer**: Standard fixed footer linking back to portfolio `(see more projects by Edward)` pointing to `https://tanguay.info` that stays pinned while page content scrolls smoothly.
- **Quality Check Guidelines**: Standardized rules for top-aligned checkboxes, non-breaking formatting (`1.99&nbsp;€`), and semantic HTML.
- **Cache Busting Ready**: Asset references include version query parameters (`css/main.css?v=1.0.0`) for reliable browser cache invalidation.

---

## NPM Scripts

- `npm run dev`: Starts the local HTTP development server
- `npm run pd`: Runs the data parsing pipeline, parsing all files in `/data`
- `npm run deploy`: Deploys site to FTP server based on data in `.env`

---

## Environment Variables & Automated Deployment

This project includes a `.env.example` file documenting the configuration needed for FTP deployment:

```env
FTP_SERVER = ftp.tanguay.info
FTP_USER = edward@tanguay.info
FTP_PASSWORD = TODO
FTP_DIRECTORY = /public_html/infosite001
```

### Setup

1. Copy `.env.example` to `.env`:
2. Fill in your actual FTP credentials in `.env` (note: `.env` is ignored by `.gitignore` and should never be committed to source control).

---

## Outline Syntax & Markdown Guide

Outline data files (`data/*.outline.dpod.txt`) are parsed using `npm run pd` into structured JavaScript data (`js/data-parsed/*.js`) and rendered with custom formatting.

### Hierarchy & Indentation
- **Indentation Level**: Use leading **tabs** (`\t`) to define indentation depth and nesting hierarchy for outline items.
- **Bullet Marker**: Lines can start with `- ` or `-` after tabs (stripped automatically during parsing).

### Inline Markdown & Text Formatting
- **Bold Text**: Wrap with double asterisks `**bold text**` (renders with `<strong class="note-bold">`).
- **Italic Text**: Wrap with single asterisks `*italic text*` (renders with `<em class="note-italic">`).
- **Markdown Links**: `[Link Label](https://example.com)` (rendered with an external link icon and label).
- **Bare URLs**: Plain URLs such as `https://example.com` or `http://...` are automatically detected and converted into clean clickable links showing the domain or YouTube badge.
- **YouTube Links**: URLs pointing to YouTube (or youtu.be) automatically display a YouTube icon badge.
- **Pronunciation Guides**: Place pronunciation text in brackets at the very end of a line, e.g. `[franswa]` &rarr; renders in a monospace font `<span class="note-pronunciation font-courier">`.

### Supported Emoticons / WhatsApp Icons
Shortcodes in outline text are automatically converted into WhatsApp-style emoji icons:

| Code | Emoji / Preview | Description |
| :--- | :--- | :--- |
| `:stareyes:` | 🤩 | Smile with blue stars as eyes |
| `:smile:` | 😊 | Normal smile |
| `:ohmygod:` | 😮 | Eyes wide open |
| `:whatever:` | 🤪 | One eye up, one down, tongue out |
| `:shootingstar:` | 💫 | Shooting star / dizzy sparkle |
| `:muscle:` | 💪 | Flexed bicep |
| `:thumbsup:` | 👍 | Thumbs up |
| `:twohearts:` | 💕 | Two pink hearts |
| `:redheart:` | ❤️ | Big red heart |
| `:water:` | 💦 | Three water drops / sweat |
| `:twinkle:` | ✨ | Sparkles |
| `:laugh:` | 😅 | Smile with water/sweat drop |
| `:check:` | ✅ | Green check mark |
| `:ohno:` | 😬 | Clenched teeth / grimace |
| `:party:` | 🎉 | Party popper cone with confetti |
| `:thinking:` | 🤔 | Thinking face |


### Image Tags
- Append `##<imagename>` at the end of any outline line (e.g. `looks like a nice little town##badsch`).
- The parser matches `<imagename>` against files in `images/outline/` (matching `.jpg`, `.jpeg`, `.png`, `.gif`, or `.webp`).
- If an image is found, it renders under the item with lazy loading; if not found, a `no image "<imagename>" found` badge is shown.

### Example Outline File
```text
- this is a main item with **bold** and *italic* text
	- here are some links:
		- https://www.marathondesgrandscrus.com
		- [Marathon des grands crus 17/10/2021 à Dijon](https://www.youtube.com/watch?v=qQCA4KLtdog)
		- course à pied [koors ah pyay]
			- https://www.openrunner.com/route-details/23448723
- Bad Schandau
	- basic info: https://de.wikipedia.org/wiki/Bad_Schandau
	- looks like a nice little town##badsch
```

