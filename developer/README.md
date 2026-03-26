# Developer Guide — PNG to Slides

Technical documentation for contributors and developers who want to run, modify, or build this Canva app.

## Requirements

- Node.js `^20`, `^22`, or `^24`
- npm `v11`
- A [Canva Developer](https://www.canva.com/developers/) account

## Setup

### 1. Clone and install

```bash
git clone https://github.com/RyanPiao/png-to-slides-canva-app.git
cd png-to-slides-canva-app
npm install
```

### 2. Configure credentials

Copy `.env.template` to `.env` and fill in your app credentials:

```bash
cp .env.template .env
```

Get your `CANVA_APP_ID` and `CANVA_APP_ORIGIN` from the [Developer Portal](https://www.canva.com/developers/apps) under **Security > Credentials > .env file**.

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

## Building for Production

```bash
npm run build
```

This outputs `dist/app.js`. Upload this bundle in the Developer Portal under **App source > JavaScript bundle**.

## Project Structure

```
png-to-slides/
├── src/
│   ├── index.tsx                          # App entry point
│   └── intents/design_editor/
│       ├── app.tsx                        # Main app component (UI + logic)
│       ├── index.tsx                      # Intent entry point
│       └── tests/                         # Unit tests
├── styles/
│   └── components.css                     # Sidebar scrollbar styling
├── scripts/                               # Dev server & build scripts
├── developer/                             # This developer documentation
├── docs/                                  # GitHub Pages (terms, privacy, support)
├── canva-app.json                         # App manifest (permissions & scopes)
├── package.json
├── tsconfig.json
└── webpack.config.ts
```

## Key APIs Used

| API | Package | Purpose |
|---|---|---|
| `FileInput` | `@canva/app-ui-kit` | Multi-file picker for PNGs |
| `getCurrentPageContext()` | `@canva/design` | Get current page dimensions |
| `addPage()` | `@canva/design` | Add new pages after current selection |
| `upload()` | `@canva/asset` | Upload images via data URL |

## Required Scopes

Configured in `canva-app.json`:

- `canva:design:content:read` — read page dimensions
- `canva:design:content:write` — add pages and elements
- `canva:asset:private:write` — upload images to user's media library

## How Image Sizing Works

Each PNG is scaled so its **height matches the page height**, then **centered horizontally**. If the scaled image is wider than the page, the sides extend beyond the edges (cropped in the final design).

```
scale = pageHeight / imageHeight
scaledWidth = imageWidth * scale
left = (pageWidth - scaledWidth) / 2
```

## Rate Limiting

The `addPage()` API allows max 3 pages/second. The app waits 350ms between insertions.

## Testing

```bash
npm test              # run tests
npm run test:watch    # watch mode
npm run lint          # check lint
npm run format:check  # check formatting
```

## Resources

- [Canva Apps SDK Documentation](https://www.canva.dev/docs/apps/)
- [Developer Portal](https://www.canva.com/developers/apps)
- [App UI Kit Storybook](https://www.canva.dev/docs/apps/app-ui-kit/storybook)
