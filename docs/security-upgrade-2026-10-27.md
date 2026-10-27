# October 2026 dependency security follow-up

Verified 2026-10-27 against the PR #40 dependency graph on Node 24.22.1.

## Findings and scope

The original lockfile's recursive npm audit contained 24 distinct GitHub-linked
advisories across eight package names: 3 critical, 8 high, 12 moderate, and 1 low.
Some advisories affected multiple installed versions, producing 27 advisory/version
records. ESLint's unsupported-version notice was a separate 28th record without a
linked security advisory. These are npm audit results, not GitHub Dependabot alert
counts. The repository's Dependabot alert-list API returned HTTP 403 with the
available token, so exact alert numbers, dismissals, and closure status were not
available. Public GitHub advisories corroborated the critical rendering findings.

## Updates included in PR #40

- `next`, `@next/mdx`, `eslint-config-next`: 16.3.3 -> 16.4.3.
- `sharp`: 0.35.4 -> 0.35.5, with prebuilt librsvg 2.63.2.
- Targeted lockfile updates within existing dependency ranges:
  - `brace-expansion`: 1.1.18 -> 1.1.21 and 5.0.9 -> 5.0.12.
  - `http-cache-semantics`: 4.2.0 -> 4.3.0.
  - `ip-address`: 10.5.0 -> 10.7.5.
  - `postcss-selector-parser`: 6.1.4 -> 6.1.5.
  - `source-map-js`: 1.2.1 -> 1.2.2.
  - `zod`: 4.4.3 -> 4.6.7.

No new direct dependencies, forced transitive resolutions, or application code
changes were needed. Next.js remains on major 16; this does include a minor
upgrade from 16.3 to 16.4 because the critical fixes require at least 16.4.1.

## Application relevance

- [Next.js Node ImageResponse RCE](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j):
  `/og` uses `runtime = "nodejs"`, `next/og` ImageResponse and a caller-controlled
  title. This is a relevant input/rendering path. Actual exploitability was not
  demonstrated; no exploit was sent to production.
- [Next.js SVG optimization RCE](https://github.com/advisories/GHSA-2464-fhr4-w9xw)
  and [sharp/librsvg](https://github.com/advisories/GHSA-wq5f-xc86-pv6w):
  the site uses image optimization and the previous locked native library was
  affected. Both Next.js and the direct sharp pin are upgraded. Exploitability
  depends on accepted image inputs and the runtime platform.
- [Typed-array use-cache RCE](https://github.com/advisories/GHSA-673q-mjm6-r5xr):
  no `use cache` functions or Cache Components configuration were found; the
  framework upgrade still removes the affected version.
- [Image optimization SSRF](https://github.com/advisories/GHSA-cjq9-62q9-8jv4):
  no `images.remotePatterns` are configured, so this app does not meet the
  advisory's stated prerequisite. The upgrade also covers this advisory.
- Remaining transitive findings concern parsing, caching and validation helpers,
  including build/lint tooling. A production dependency classification is not
  proof that every such package is reachable in the standalone server.

## Validation

All checks ran in an isolated `node:24.22.1-bookworm` development container.

- `yarn install --immutable`: PASS after the targeted lockfile refresh.
- `yarn build`: PASS (Next.js 16.4.3; 20 static pages).
- `yarn typecheck`: PASS.
- `yarn lint`: PASS (0 errors, 47 existing warnings).
- `yarn npm audit --all --recursive --environment production --json`: PASS,
  exit 0, no findings.
- `yarn npm audit --all --recursive --json`: exit 1 only for ESLint 9.39.5's
  unsupported-version notice; none of the 24 linked advisories remain reported.
- Standalone smoke: PASS, 13/13 checks: six HTML routes, audio configuration,
  unauthenticated auth response, PDF bytes, optimized image rendering, two `/og`
  titles (including punctuation/Unicode), and benign SVG-to-PNG decoding.
- Native runtime versions verified: sharp 0.35.5 and librsvg 2.63.2. The 48 public
  LFS assets used for smoke checks were verified against their SHA-256 hashes.
- `git diff --check`: PASS.

The existing Yarn 4.0.1 optional TypeScript compatibility-patch warning remains.
ESLint 10 migration is deliberately deferred as a separate tooling-major change.
No vulnerability suppression or audit exclusions were added.

## Remaining operational work

This is not evidence of a production deployment or of Dependabot alert closure.
The self-hosted runner prerequisites and separate production Node runtime upgrade
from PR #40 still apply. Coordinate merge with those checks because the existing
release workflow can feed deployment automation. A clean audit is a snapshot of
known advisories, not a guarantee that the application has no vulnerabilities.
