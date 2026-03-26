# PNG to Slides — Canva App

Quickly turn a folder of PNG images into presentation slides in Canva. Perfect for importing slides exported from other tools like reveal.js, PowerPoint, or Keynote.

## How It Works

1. Open your presentation in Canva
2. Select the page where you want new slides to start
3. Open **PNG to Slides** from the Apps sidebar
4. Pick your PNG files (you can select multiple at once)
5. Click **Insert Slides** — done!

Each image becomes a new full-page slide, inserted right after your selected page.

## Features

- **Batch insert** — add dozens of slides in one click
- **Automatic ordering** — files are sorted by filename, so `page_001.png` comes before `page_002.png`
- **Full-page fit** — images are scaled to fill the page height and centered
- **Progress tracking** — see a progress bar as slides are inserted
- **No data collection** — your images go straight to Canva, nothing is stored or sent elsewhere

## Tips

- **Use zero-padded filenames** for correct ordering: `page_001.png`, `page_002.png`, ..., `page_099.png`
- **Select the right starting page** before inserting — slides are added after the currently selected page
- **PNG only** — other image formats are not supported
- **File size** — keep individual PNGs under 10 MB for best performance
- **Speed** — the app inserts about 3 slides per second (Canva API limit)

## FAQ

**Where do slides get inserted?**
After the page you currently have selected in the editor. If you're on page 5, new slides start at page 6.

**Can I undo?**
Yes — use Canva's undo (`Ctrl/Cmd + Z`) to remove inserted pages.

**Why is the insert button disabled?**
Either no files are selected, or you're in a design type that doesn't support adding pages (like Whiteboards or Docs). The app works with Presentations.

**The app seems slow with many files?**
Canva limits page additions to 3 per second. For 100 slides, expect about 35 seconds.

## Links

- [Support & FAQ](https://ryanpiao.github.io/png-to-slides-canva-app/support.html)
- [Privacy Policy](https://ryanpiao.github.io/png-to-slides-canva-app/privacy.html)
- [Terms & Conditions](https://ryanpiao.github.io/png-to-slides-canva-app/terms.html)

## For Developers

See the [developer guide](developer/README.md) for setup instructions, project structure, and technical documentation.

## License

See [LICENSE.md](LICENSE.md) for the Canva SDK license terms.
