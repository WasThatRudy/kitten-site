# kitten-site

Marketing landing page for [Kitten](https://github.com/pointblank-club/Kitten), an open-source (GPL-3.0) tool that safely rearranges disk partitions in place: one reboot, no live USB, journaled end to end, so a power cut mid-move loses nothing.

The page's centerpiece is an interactive "pull the plug" demo: drag a partition boundary, watch the chunked, journaled move run, cut the power at the worst moment, and watch the recovery console resume from the exact chunk it stopped at. The hero headline is the button.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- Plain Canvas 2D + a small state machine for the disk demo (`components/demo/PlugDemo.tsx`)
- React Three Fiber for the migration teaser scene (lazy-loaded)
- Native CSS scroll-driven animations for the "how it works" sequence
- Fonts: Bricolage Grotesque (variable width/optical size) + JetBrains Mono

## Develop

```bash
pnpm install
pnpm dev
```

## Deploy

Static-friendly Next.js app; deploys as-is to Vercel or Netlify. No environment variables, no secrets, fully self-contained (fonts are self-hosted at build time by `next/font`).

## Notes

- Brand palette: `#000`, `#F4F6F5`, and signal green `#00D86A` (sampled from the logo).
- Copy is deliberately honest: Kitten is under active development; the page never claims encrypted transport or production readiness, and marks machine-to-machine migration as coming soon.
- This repo is a standalone personal project intended to be transferred to the `pointblank-club` org later. Nothing org-specific is hardcoded beyond public repo links.
