# Portfolio - norstep4700.com

Personal portfolio website for Preston Johnson. [norstep4700.com](https://norstep4700.com)

[See the description on the live website](https://norstep4700.com/work/customizing-portfolio-template-instance)

## Building from Scratch

This project uses `yarn` as a package manager but swapping in `npm` should work if desired.

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

Releases are published on GitHub via CI whenever a pull request to the `main` branch is approved. This is built in standalone mode with `next.js` so all dependencies are rolled into the release except `node.js`. On a machine with `node.js` installed, running `node {PATH_TO_RELEASE}/server.js` will start the server on port 3000.

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
