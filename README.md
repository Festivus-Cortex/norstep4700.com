# Portfolio - norstep4700.com

Personal portfolio website for Preston Johnson. [norstep4700.com](https://norstep4700.com)

[See the description on the live website](https://norstep4700.com/work/customizing-portfolio-template-instance)

## Building from Scratch

This project uses `yarn` as a package manager but swapping in `npm` should work if desired.

`yarn dev` will run the site in development mode with hot module swapping.
`yarn build` will output the production site content.
`yarn start` will run the build generated from `yarn build`.

## Deploying from a Release

Releases are published on GitHub via CI whenever a pull request to the `main` branch is approved. This is built in standalone mode with `next.js` so all dependencies are rolled into the release except `node.js`. On a machine with `node.js` installed, running `node {PATH_TO_RELEASE}/server.js` will start the server on port 3000.

For production use, using a proxy like `nginx` to host the incoming traffic of `https` is recommended. Using `pm2` to help manage the node process is helpful also.

## Future Considerations

- Audio Visual WOW Factor
- CI Improvements
  - Pulling version number for releases
  - Automated Deployment
  - Linting?
- General commenting and clean up

## Template

See README-TEMPLATE.md for template detail and the LICENSE file for details.

Thank you to OnceUI for their amazing components and portfolio template that was a wonderful foundation!
