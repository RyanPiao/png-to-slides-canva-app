# PNG to Slides — Canva App

A Canva app that bulk-inserts PNG files as full-page slides into your presentations. Select multiple PNGs, and they're automatically added as new pages after the currently selected page, sorted by filename.

## What It Does

1. **Select PNG files** — pick multiple PNGs from your computer (e.g., `page_001.png`, `page_002.png`, ...)
2. **Auto-sort by filename** — files are sorted alphabetically so pages appear in the correct order
3. **Insert as full-page slides** — each PNG is scaled to match the page height and centered horizontally
4. **Pages added after current selection** — starts inserting after whichever page you have selected

This is ideal for importing exported slides from other presentation tools (reveal.js, PowerPoint, Keynote, etc.) into Canva.

## Screenshot

The app appears in the Canva sidebar with:
- A file picker for selecting multiple PNGs
- An "Insert Slides" button with progress tracking
- A file list showing selected files with delete controls

## Requirements

- Node.js `^20`, `^22`, or `^24`
- npm `v11`
- A [Canva Developer](https://www.canva.com/developers/) account

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/RyanPiao/png-to-slides-canva-app.git
cd png-to-slides-canva-app
npm install
```

### 2. Configure the app

Copy `.env.template` to `.env` and fill in your app credentials:

```bash
cp .env.template .env
```

Update the `CANVA_APP_ID` and `CANVA_APP_ORIGIN` values from your [Developer Portal](https://www.canva.com/developers/apps) app settings under **Security > Credentials > .env file**.

### 3. Start the dev server

```bash
npm start
```

The server starts at `http://localhost:8080`.

### 4. Preview in Canva

1. Go to your app in the [Developer Portal](https://www.canva.com/developers/apps)
2. Set **App source > Development URL** to `http://localhost:8080`
3. Click **Preview** to open Canva with the app loaded
4. Click **Open** (first time only)

### 5. Use the app

1. Open a presentation in Canva
2. Select the page after which you want to insert slides
3. Open the PNG to Slides app from the sidebar
4. Select your PNG files
5. Click **Insert Slides**

## Building for Production

To create a production bundle:

```bash
npm run build
```

This outputs `dist/app.js`. You can upload this bundle in the Developer Portal under **App source > JavaScript bundle**.

## How It Works

### Image Sizing

Each PNG is scaled so its **height matches the page height**, and it's **centered horizontally**. If the image is wider than the page after scaling, the sides extend beyond the page edges (cropped in the final design).

```
scale = pageHeight / imageHeight
scaledWidth = imageWidth * scale
left = (pageWidth - scaledWidth) / 2
```

### Rate Limiting

The `addPage()` API has a rate limit of 3 pages per second. The app waits 350ms between page insertions to stay within this limit.

### File Sorting

Files are sorted alphabetically by filename. Use zero-padded names (e.g., `page_001.png`, `page_002.png`) for correct ordering.

## Project Structure

```
png-to-slides/
├── src/
│   ├── index.tsx                          # App entry point
│   └── intents/design_editor/
│       ├── app.tsx                        # Main app component (UI + logic)
│       └── index.tsx                      # Intent entry point
├── styles/
│   └── components.css                     # Sidebar styling
├── scripts/                               # Dev server scripts
├── canva-app.json                         # App manifest (permissions)
├── package.json
├── tsconfig.json
├── webpack.config.ts
└── docs/                                  # GitHub Pages (terms, privacy, support)
    ├── terms.html
    ├── privacy.html
    └── support.html
```

## Key APIs Used

| API | Package | Purpose |
|---|---|---|
| `FileInput` | `@canva/app-ui-kit` | Multi-file picker for PNGs |
| `getCurrentPageContext()` | `@canva/design` | Get current page dimensions |
| `addPage()` | `@canva/design` | Add new pages after current selection |
| `upload()` | `@canva/asset` | Upload images via data URL |

## Required Scopes

These are configured in `canva-app.json`:

- `canva:design:content:read` — read page dimensions
- `canva:design:content:write` — add pages and elements
- `canva:asset:private:write` — upload images to user's media library

## License

See [LICENSE.md](LICENSE.md) for the Canva SDK license terms.

## Links

- [Canva Apps SDK Documentation](https://www.canva.dev/docs/apps/)
- [Developer Portal](https://www.canva.com/developers/apps)
- [Terms & Conditions](https://ryanpiao.github.io/png-to-slides-canva-app/terms.html)
- [Privacy Policy](https://ryanpiao.github.io/png-to-slides-canva-app/privacy.html)
- [Support](https://ryanpiao.github.io/png-to-slides-canva-app/support.html)
