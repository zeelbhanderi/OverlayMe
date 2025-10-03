# OverlayMe

OverlayMe is a small Next.js app for creating a personalized celebration image by overlaying a user photo on top of a branded background, adding a name and phone number, and exporting the result as a PNG.

This repo contains a minimal UI and a client-side image-processing component that composes the final image using an offscreen HTML canvas.

## Key features

- Upload a user photo (PNG/JPG/GIF).
- Overlay the photo in a hexagonal clip on top of a background logo/image.
- Add a name and phone number rendered onto the final image.
- Preview the generated image and download it as a PNG.
- Client-side processing only — no server-required image manipulation.

## Quick demo

Open the app, fill in your name and phone number, upload a photo, then click "Create Celebration Image". When processing completes you can download the generated PNG.

## Project structure (important files)

- `src/components/ImageOverlay.tsx` — main component that handles inputs, validation and converts the uploaded image + logo into a combined canvas PNG.
- `src/app/page.tsx` — page that renders the component and site layout.
- `public/images/company-logo.png` — default background/logo used for composition (logo path referenced as `/images/company-logo.png`).
- `package.json` — scripts and dependencies.

## Requirements

- Node.js (recommend v18 or newer)
- npm (or yarn/pnpm — examples below use npm)

## Install

Install dependencies in the repo root:

```bash
npm install
```

## Run (development)

Start the Next.js development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000 by default.

## Build & Start (production)

Build and start commands:

```bash
npm run build
npm run start
```

## Available scripts

- `npm run dev` — start development server (uses `next dev --turbopack`).
- `npm run build` — production build.
- `npm run start` — start server from production build.
- `npm run lint` — run linter (Next.js eslint config).

## How Image generation works (implementation notes)

- The `ImageOverlay` component reads the uploaded image into a data URL using `FileReader`.
- A hidden `<canvas>` is used to draw the background logo first and then draw the user image in a hexagonal clipping path.
- Name and phone number are drawn on top with a drop shadow to improve visibility.
- The canvas is converted to a PNG data URL (`canvas.toDataURL('image/png')`) and displayed for preview + download.

Important implementation details and known limitations

- The logo is loaded from `/images/company-logo.png`. If you want a different background, replace that file or change `logoPath` inside `src/components/ImageOverlay.tsx`.
- The component uses fixed manual positions (example: `manualXPosition` and `manualYPosition`) and fixed dimensions for the overlaid image; adjust those constants in `ImageOverlay.tsx` to change placement and sizing.
- All processing is client-side; large images can increase memory/time for canvas operations. Consider pre-resizing on the client if you need to handle big files.
- CORS: the component sets `crossOrigin = 'anonymous'` when loading images. Make sure hosted images permit cross-origin access if you change `logoPath` to an external URL.

## Customization

- To change the logo/background: replace `public/images/company-logo.png` or update `logoPath` in `src/components/ImageOverlay.tsx`.
- To change overlay shape or sizing: edit the clipping and drawing math inside `processImage()` in `src/components/ImageOverlay.tsx`.
- To change default fonts or position of the text, update the canvas drawing calls (font, fillStyle, textAlign, coordinates).

## Development notes & debugging

- The canvas is hidden in the DOM (`style={{ display: 'none' }}`) — useful to inspect during development by temporarily removing that style.
- Error messages from the component surface in the UI; check the browser console for detailed stack traces when something fails.

## Contributing

Contributions are welcome. Small improvements that help other developers are especially useful (readme updates, accessibility improvements, responsive layout fixes, small tests).

If you plan to change visual behavior, try to keep default layout and sizing configurable rather than hard-coded.

## License

This project includes a `LICENSE` file in the repository root. Refer to it for license terms.

## Contact

© {new Date().getFullYear()} Zeel Bhanderi — see repository for author/contact details.

---

If you want, I can also:

- Add a small CONTRIBUTING.md with a development checklist.
- Wire up a tiny unit test for the validation logic in `ImageOverlay`.
- Create a lightweight screenshot.md that references the images in `screenshots/`.

Tell me which of those you'd like next.

# OverlayMe
