# Next.js Upgrade Research - 2026-05-06

## Recommendation

Do not jump `Festivus-Cortex/norstep4700.com` straight to Next 16 as the first production fix. It is technically realistic, but risk is medium-high right now because the repo has a custom `webpack` config for `pdfjs-dist`, mixed App Router plus Pages API routes, no working lint gate, and a standalone self-hosted release flow.

Best immediate target: `next@15.5.15` and `@next/mdx@15.5.15`. The repo was already on `15.5.14`, which is above the December 2025 RSC security floor for the 15.5 line, but `15.5.15` is the current 15.x backport tag on npm as of this research.

## Repo State Inspected

- Repo path: `/repos/norstep4700.com`
- Commit: `cfd94def10030e45fe1d0613a1e76b26cb129377`
- Current stack before patch:
  - `next`: `15.5.14`
  - `@next/mdx`: `15.5.14`
  - `react` / `react-dom`: `19.1.1`
  - Yarn `4.0.1`, `nodeLinker: node-modules`
  - Node on local host: `24.14.0`
- Routing:
  - App Router under `src/app`
  - Pages API routes under `src/pages/api`
- Config:
  - `output: "standalone"`
  - Custom server-side webpack alias for `pdfjs-dist`
  - `lint` script still uses deprecated `next lint`

## Baseline Findings

- `yarn build` completed successfully on `next@15.5.14`.
- Build printed: `ESLint must be installed in order to run during builds`.
- `yarn lint` failed because `next lint` is deprecated and `eslint` is missing.

## Next 16 Risks That Matter

- Next 16 requires Node `>=20.9.0`; verify the self-hosted GitHub runner and production host before upgrading.
- Next 16 uses Turbopack by default for `next dev` and `next build`; a project with a custom webpack config will fail unless it migrates to Turbopack config or opts out with `next build --webpack`.
- Next 16 removes `next lint`; lint must be run via ESLint or another tool directly.
- Next 16 fully removes synchronous dynamic request API compatibility. This repo already appears migrated for dynamic `params`, but should still run codemods/typegen checks.
- React should be moved from `19.1.1` to current `19.2.x` during a Next 16 attempt only after checking `react-pdf`, `next-mdx-remote`, MDX, and custom Once UI components.
- Browser smoke coverage is important for work detail pages, resume PDF rendering, gallery/images, route transitions, and audio pages.

## Recommended Migration Plan

1. Low-risk security patch now:
   - Upgrade `next` and `@next/mdx` to `15.5.15`.
   - Keep React at `19.1.1`.
   - Run install, build, local server smoke checks.

2. Restore lint:
   - Replace `next lint` with ESLint CLI using the official codemod or a manual migration.
   - Install the missing ESLint packages.
   - Decide whether to keep `.eslintrc.json` temporarily or migrate to flat config.

3. Prepare for Next 16:
   - Verify CI and production Node are `>=20.9.0`.
   - Audit and resolve the `pdfjs-dist` webpack alias.
   - Run async request API checks and `next typegen`.
   - Confirm no hidden `middleware`, AMP, runtime config, unstable APIs, or parallel route slot requirements.

4. Conservative Next 16 attempt:
   - Upgrade to latest stable Next 16, matching `@next/mdx`, React, React DOM, and React types.
   - Start production builds with `next build --webpack` if the `pdfjs-dist` alias still exists.
   - Validate standalone release artifact and route behavior.

5. Ambitious follow-up:
   - Remove the webpack dependency and migrate fully to Turbopack-compatible config.
   - Re-test standalone build, MDX, Sass, `react-pdf`, and runtime pages.

## Sources

- Next 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next 15 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-15
- Dynamic APIs migration note: https://nextjs.org/docs/messages/sync-dynamic-apis
- Next.js security update, 2025-12-11: https://nextjs.org/blog/security-update-2025-12-11
