# Love Home And Gallery Design

## Context

Ading & Lili is a static romantic memory site deployed through GitHub Pages. The current site already has password entry, music playback, love-day counter, daily quote, date cards, photo gallery, timeline, and a persistent giscus message board.

The next improvement should not add backend complexity. The first phase should make the existing site feel more like a private love album: stronger first screen, more natural photo browsing, and a cleaner large-photo viewer.

## Goals

- Make the first screen feel like a dedicated romantic cover, not a stack of independent widgets.
- Turn the photo grid into a more album-like gallery that respects photo proportions.
- Improve the large-photo viewer so browsing feels deliberate and polished.
- Preserve the current GitHub Pages deployment, automatic photo preprocessing, music playlist, giscus message board, timeline, and password flow.
- Keep the implementation in vanilla HTML, CSS, and JavaScript.

## Non-Goals

- No new backend, database, or cloud service.
- No change to GitHub Pages deployment logic.
- No replacement of giscus.
- No new account system or private upload dashboard.
- No large framework migration.
- No broad redesign of every section in this phase.

## Recommended Approach

Use a focused visual refresh around the current single-page structure.

The first screen becomes a composed cover: title, names, love-day counter, music player, and a daily quote arranged as one intentional scene. The gallery becomes a masonry-style album using the already generated thumbnails and full-size images. The popup becomes a photo viewer with clearer controls, metadata, and responsive layout.

This is recommended over adding new features first because the current functional base is already solid. The biggest quality gap is presentation and browsing flow, not data capability.

## Visual Direction

The site should feel private, warm, and photographic rather than toy-like or template-like.

Palette:

- Soft rose: `#ff6f61`, retained as the existing primary color.
- Deep rose text: `#5c3d3d`, for warmer readable text.
- Paper white: `#fffdfb`, for surfaces.
- Blush background: `#fff2f1`, for ambient sections.
- Muted ink: `#716061`, for secondary text.
- Warm gold accent: `#a16207`, used sparingly for date/detail accents.

Typography:

- Keep the current romantic display feel for the title.
- Use Chinese-friendly body text for readability.
- Use the handwritten Chinese font only for quote-like moments, not for dense UI.

Signature element:

- The cover should use real couple photos as the emotional anchor. Background gradients can support the scene, but they should not be the main visual signal.

## Page Structure

### Cover Section

Current `nameSection`, `timerSection`, and `quoteSection` should visually read as one hero area.

Content:

- Site title and couple names.
- Love-day count as the primary number.
- Music player as a compact control inside the cover.
- Daily quote as a quiet handwritten note.
- One featured photo or photo collage pulled from existing image files.

Behavior:

- The fixed top nav can remain, but the cover needs enough top spacing so content is not hidden.
- On desktop, use a two-column composition: text/music/count on one side, featured photo composition on the other.
- On mobile, stack cover content in this order: title/names, love-day count, music player, featured image, quote.

### Gallery Section

Replace the square grid with a masonry album.

Content:

- Use existing `images/thumbs/N.jpg` for visible thumbnails.
- Use existing `images/N.jpg` for the large viewer.
- Keep lazy/incremental loading.

Layout:

- Desktop: CSS columns or a masonry-like layout with varied heights.
- Tablet: two or three columns depending on viewport.
- Mobile: two columns, with enough gap to avoid accidental taps.
- Keep `object-fit` only where needed; do not force every image into a square crop.

Interaction:

- Hover on desktop should lift the image subtly and reveal a soft date label if available.
- Touch devices should not require hover to understand the item is tappable.
- Each image keeps a stable target size and `cursor: pointer`.

### Photo Viewer

Improve the existing popup instead of introducing a separate route.

Content:

- Full image.
- Close button.
- Previous and next controls.
- Date when available.
- Current position, for example `3 / 30`.

Behavior:

- `Escape` closes the viewer.
- Left and right arrow keys move between loaded images.
- Clicking outside the photo can close the viewer.
- Controls must be at least 44px touch targets.
- The viewer should not produce horizontal scrolling on mobile.

## Components And Files

Expected touched files during implementation:

- `index.html`: adjust section grouping and add small metadata elements where needed.
- `css/style.css`: cover layout, gallery masonry, viewer styling, responsive rules, motion preferences.
- `js/app.js`: add gallery item metadata, viewer position text, backdrop click behavior, and any needed class toggles.

Files that should not need broad changes:

- `config.js`: no required schema change for phase one.
- `.github/workflows/deploy-pages.yml`: no deployment change.
- `scripts/preprocess.py`: no preprocessing change.
- `css/giscus-love.css`: no change unless a small visual alignment becomes necessary.

## Data Flow

Photo loading remains the same:

1. `loadImages()` requests batches by numeric index.
2. `loadThumbnail()` tries `images/thumbs/N.jpg`.
3. If the thumbnail is missing, it falls back to `images/N.jpg`.
4. `createImageElement()` creates the gallery item and stores full image metadata in `loadedImages`.
5. `showPopup()` opens the full-size photo viewer.

The design should extend this flow rather than replace it.

## Error Handling

- If a thumbnail fails but the full image loads, show the full image as fallback as today.
- If both fail, skip that image and continue.
- If a full image fails in the viewer, show the existing failure message in a styled state.
- If EXIF date is unavailable, hide the date label instead of showing empty text.
- If there is no next loaded image, disable the next control clearly.

## Accessibility And UX Requirements

- Maintain visible focus states for buttons and interactive images.
- Preserve keyboard navigation in the viewer.
- Add meaningful `alt` text based on image number and date when available.
- Respect `prefers-reduced-motion` by disabling or reducing decorative animations.
- Keep text at readable sizes on mobile.
- Avoid horizontal scroll at 375px width.
- Ensure touch targets are at least 44px for player, viewer, and gallery controls.

## Performance Requirements

- Continue using thumbnails for gallery rendering.
- Do not eagerly load every full-size image.
- Use image dimensions or layout constraints where possible to reduce layout jump.
- Avoid continuous decorative animations in the gallery.
- Keep the implementation dependency-free.

## Verification Plan

Local checks:

- Open the site locally and verify login, music player, quote, gallery, timeline, and message board layout still render.
- Test desktop width around 1440px.
- Test tablet width around 768px.
- Test mobile width around 375px.
- Open photo viewer, navigate previous/next, close with button and `Escape`.
- Scroll to confirm quote and gallery do not overlap other sections.
- Confirm no horizontal scrolling on mobile.

Deployment checks:

- Commit and push implementation changes.
- Wait for GitHub Actions Pages deployment to pass.
- Open `https://LuckyKingADing.github.io/ading-lili-website/`.
- Hard refresh if browser cache shows old CSS or JS.

## Success Criteria

- First screen reads as a romantic cover with a clear visual focal point.
- Gallery shows photos as an album rather than uniform square tiles.
- Large photo browsing feels polished on desktop and mobile.
- Existing deployment and content-management workflow remains unchanged.
- No current features regress: password entry, music, daily quote, timeline, gallery loading, and giscus messages still work.
