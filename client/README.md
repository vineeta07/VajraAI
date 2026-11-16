# VajraAI client

React + Vite front end for VajraAI.

```bash
npm install
npm run dev      # http://localhost:3039, proxies /api to http://localhost:3000
npm run build
npm run lint
```

## Configuration

| Variable       | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `VITE_API_URL` | Origin of the API server, no trailing slash. Leave empty in local dev.  |

## Layout

```
src/
  lib/         API client, error descriptions, pipeline status, auth, theme, formatting
  ui/          Buttons, cards, inputs, badges, table styles
  components/  Notices, pipeline checklist, walkthrough, charts
  layouts/     Signed-in shell and the sign-in layout
  pages/       One file per route
  global.css   Design tokens (light and dark) and base styles
```

## Design notes

- Colours, fonts and shadows are CSS variables in `global.css`; dark mode only swaps their values.
- Type: Source Serif 4 for headings and figures, IBM Plex Sans for text, IBM Plex Mono for IDs.
- A page never shows an unexplained blank. `lib/pipeline.js` works out which of four steps
  (server reachable, database connected, data uploaded, analysis run) is missing, and
  `components/PipelineStatus.jsx` shows that step with the fix.
- The walkthrough (`components/Tour.jsx`) opens on a user's first sign-in and can be replayed
  from “Take the tour” in the top bar.
