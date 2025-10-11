# Chemistry AoPS

A static front-end prototype for a Chemistry Art of Problem Solving community. The site ships as portable HTML, CSS, and JavaScript assets so you can open it locally or deploy it to any static host.

## Project structure

```
Chem_AoPS/
├── index.html          # Primary entry point (also duplicated as main_thing.html)
├── main_thing.html     # Legacy filename kept for compatibility
├── assets/
│   ├── css/
│   │   └── main.css    # Shared styling
│   └── js/
│       └── app.js      # Forum & wiki interactivity with localStorage
└── CNAME               # Optional custom-domain configuration
```

Both `index.html` and `main_thing.html` load the same interface. The extra `index.html` makes GitHub Pages and other static hosts pick up the site automatically without renaming files.

## Local preview

Open `index.html` (or `main_thing.html`) directly in your browser:

```bash
xdg-open index.html   # Linux
open index.html       # macOS
start index.html      # Windows
```

All forum threads and wiki pages are stored in `localStorage`, so each browser keeps its own sandboxed copy of your data.

## Deployment

Because the project is entirely static you can deploy it anywhere that serves HTML files:

- **GitHub Pages** – Commit the repo, push to GitHub, and enable Pages. The presence of `index.html` means the site will be served automatically. Keep the `CNAME` file if you want the `hello123456.com` custom domain (replace with your own).
- **Netlify / Vercel / Cloudflare Pages / S3** – Drag and drop the folder or upload via CLI. Again, `index.html` will act as the default entry point.

If you prefer to serve `main_thing.html` specifically, point your host to that file or keep both files in sync as this repository does.

## Customising

- Edit `assets/css/main.css` to adjust colors, layout, or typography.
- Update `assets/js/app.js` to seed new example threads or change how the forum/wiki behave.
- Swap out content inside `index.html` for new landing copy or additional sections.

Pull requests are welcome if you expand the curriculum, add moderation tools, or integrate a real backend.
