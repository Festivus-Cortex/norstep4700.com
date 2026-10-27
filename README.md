# Portfolio - norstep4700.com

Personal portfolio website for Preston Johnson. [norstep4700.com](https://norstep4700.com)

[See the description on the live website](https://norstep4700.com/work/customizing-portfolio-template-instance)

## Building from Scratch

Use Node.js **24.22.1 or a newer patched 24.x release**. The October 2026
security baseline is pinned in `.nvmrc`; CI reads that file and `package.json`
limits supported runtimes to the tested Node 24 LTS line. Keep those versions
aligned when raising the security baseline. Node 20 is end-of-life.

```sh
nvm install
nvm use
corepack enable
yarn install --immutable
```

This project uses the Yarn version pinned by `packageManager` in `package.json`.
Enable the Corepack bundled with the official Node 24 distribution as shown above.
The self-hosted GitHub Actions runner must be version **2.327.1 or newer** to
run `actions/setup-node@v6`.

`yarn dev` will run the site in development mode with hot module swapping.
`yarn build` will output the production site content.
`yarn start` will run the build generated from `yarn build`.

CI is done using github actions. See `.github\workflows\release.yml`.

Automated deployments are being handled separately with [`n8n`](https://github.com/n8n-io/n8n).

## Browser Requirements

This portfolio uses several modern browser APIs to deliver audio-visual experiences. The following browser features are required for full functionality:

### Required APIs

- **Web Audio API** - Used for audio playback, analysis, and effects processing

  - `AudioContext` for audio graph management
  - `AnalyserNode` for frequency and time-domain audio analysis
  - `GainNode` for volume control and mixing
  - Browser support: All modern browsers (Chrome, Firefox, Safari, Edge)

- **Page Visibility API** - Used to automatically pause audio when the browser tab is hidden

  - `document.hidden` and `visibilitychange` event
  - Browser support: All modern browsers

- **requestAnimationFrame** - Used for smooth visual effects synchronized with audio
  - Browser support: All modern browsers

### Graceful Degradation

The site is designed to gracefully degrade if these APIs are unavailable:

- Audio features will display an error message if Web Audio API is not supported
- Visual effects will continue to work even if audio is not available
- The site remains fully navigable and readable without any audio-visual features

## Deploying from a Release

[![Release Build](https://github.com/Festivus-Cortex/norstep4700.com/actions/workflows/release.yml/badge.svg)](https://github.com/Festivus-Cortex/norstep4700.com/actions/workflows/release.yml)

Releases are published on GitHub via CI whenever a pull request to the `main` branch is merged. This is built in standalone mode with `next.js` so all dependencies are rolled into the release except `node.js`. On a machine with the patched Node 24 runtime installed, running
`node {PATH_TO_RELEASE}/server.js` will start the server on port 3000.

**Upgrading CI or deploying the ZIP does not upgrade production Node.js.** The
separate n8n deployment/process-manager configuration must select Node 24.22.1
or a newer patched 24.x release, then restart the application with that binary.
Verify the running process's executable and version (not just an interactive
shell's `node --version`), and check the homepage, `/api/audio-config`, and
`/api/check-auth` after the restart. No production runtime upgrade is performed
by this repository change.

The [October 21, 2026 Node.js security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
fixes high-severity DNS/TLS issues and a Brotli decoder memory-corruption issue,
among others. Exposure depends on the actual runtime and reachable code paths;
the source version requirement alone does not prove production is patched.

For rollback, retain the previous application release and process-manager
configuration. Prefer running the previous application on the patched Node 24
runtime; reverting to an affected Node version reintroduces the security risk.

For production use, using a proxy like `nginx` to host the incoming traffic of `https` is recommended. Using `pm2` to help manage the node process is helpful also.

## Future Considerations

There is no timeline or guarantee on the implementation of these items. But they
are considerations for expanding.

- Audio Visual Effects

  - Add intensity selector
    - balanced intensity configs for each animator
  - Consider adding better configuration controls or limits
  - Performance metrics display
  - Expand effects
    - Animate more than just the background
    - Simplify setup of new effects

- Containerize the project
- More commenting including some templated areas
- Address the few miscellaneous TODO's
- Add new library to handle linting as the previous went out of date
- Add unit tests where applicable
- Add logging library/utility and remove direct console.\* calls

## Template

See README-TEMPLATE.md for template detail and the LICENSE file for details.

Thank you to OnceUI for their amazing components and portfolio template that was a wonderful foundation!
