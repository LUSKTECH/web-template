# Lusk Website Template

[![CI](https://github.com/LUSKTECH/web-template/actions/workflows/ci.yml/badge.svg)](https://github.com/LUSKTECH/web-template/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/LUSKTECH/web-template/branch/main/graph/badge.svg)](https://codecov.io/gh/LUSKTECH/web-template)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=LUSKTECH_web-template&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=LUSKTECH_web-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A reusable Next.js + TypeScript website template for Lusk Technologies. Ships with compliance pages, analytics/monitoring integrations, security tooling, CI/CD workflows, GitHub community documents, and deployment support for both Vercel and Netlify.

## Features

- **Next.js 16** with TypeScript 5.9 and App Router
- **Region-adaptive cookie consent** — GDPR (EU), CCPA (California), and general banners
- **Privacy Policy & Terms of Service** pages with placeholder content
- **SEO** — Open Graph, Twitter Cards, JSON-LD structured data, sitemap, robots.txt
- **Security headers** — CSP, X-Frame-Options, HSTS, and more via `vercel.json` / `netlify.toml`
- **Analytics** — Configurable provider (Google Analytics, Plausible, Umami) gated on cookie consent
- **Axiom** — Structured logging for page views, errors, and Web Vitals
- **Sentry** — Client + server error tracking with source map uploads
- **Pre-commit hooks** — Husky + lint-staged + commitlint (Conventional Commits)
- **Linting & formatting** — ESLint 10 + Prettier 3.8
- **Testing** — Vitest + fast-check property-based tests with Istanbul coverage
- **CI/CD** — 11 GitHub Actions workflows with secret-guarded graceful skipping
- **Deployment** — Vercel and Netlify configs included
- **Community docs** — LICENSE, CODE_OF_CONDUCT, SECURITY, issue/PR templates, CODEOWNERS

## Quick Start

```bash
# 1. Clone the template (or click "Use this template" on GitHub)
git clone https://github.com/LUSKTECH/lusk-website-template.git my-site
cd my-site

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local — at minimum set NEXT_PUBLIC_SITE_URL

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Available Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Next.js development server |
| `npm run build`         | Production build                     |
| `npm start`             | Serve the production build           |
| `npm run lint`          | Run ESLint                           |
| `npm run format`        | Check formatting with Prettier       |
| `npm run format:fix`    | Auto-fix formatting                  |
| `npm run test`          | Run tests in watch mode              |
| `npm run test:run`      | Run tests once (CI mode)             |
| `npm run test:coverage` | Run tests with Istanbul coverage     |

## Environment Variables

Copy `.env.example` to `.env.local` and configure the values for your project. Required variables block the build; optional variables produce a warning if missing.

| Variable                | Required | Purpose                                              | Used By                                       |
| ----------------------- | -------- | ---------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | Yes      | Public site URL for SEO metadata and canonical links | App, SEO component                            |
| `NEXT_PUBLIC_GA_ID`     | No       | Google Analytics measurement ID                      | Analytics integration                         |
| `AXIOM_TOKEN`           | No       | Axiom API token for structured log ingestion         | Axiom integration                             |
| `AXIOM_DATASET`         | No       | Axiom dataset name for log routing                   | Axiom integration                             |
| `SENTRY_DSN`            | No       | Sentry DSN for error capture                         | Sentry integration                            |
| `SENTRY_AUTH_TOKEN`     | No       | Sentry auth token for source map uploads             | Build process                                 |
| `DISCORD_WEBHOOK_URL`   | No       | Discord webhook for CI/CD notifications              | `discord-notify.yml`                          |
| `VERCEL_TOKEN`          | No       | Vercel deployment token                              | `deploy-preview.yml`, `deploy-production.yml` |
| `NETLIFY_AUTH_TOKEN`    | No       | Netlify deployment token                             | `deploy-preview.yml`, `deploy-production.yml` |
| `CODECOV_TOKEN`         | No       | Codecov upload token for coverage reports            | `ci.yml`                                      |
| `LHCI_GITHUB_APP_TOKEN` | No       | Lighthouse CI GitHub App token                       | `lighthouse.yml`                              |
| `TRIVY_ENABLED`         | No       | Set to `true` to enable Trivy scanning               | `security.yml`                                |
| `SNYK_TOKEN`            | No       | Snyk API token for dependency scanning               | `security.yml`                                |
| `SAFETY_API_KEY`        | No       | Safety CLI API key for Python dependency scanning    | `security.yml`                                |
| `SONAR_TOKEN`           | No       | SonarQube token for code quality analysis            | `sonarqube.yml`                               |
| `QLTY_TOKEN`            | No       | qlty.sh token for code quality metrics               | `qlty.yml`                                    |

All optional secrets should be added as GitHub repository secrets for CI workflows to use them.

## Deployment

### Vercel

1. Push your repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Set environment variables in the Vercel dashboard (at minimum `NEXT_PUBLIC_SITE_URL`).
4. Vercel auto-detects Next.js — no additional build config needed.
5. Security headers are configured in `vercel.json`.

For CI-driven deployments, add `VERCEL_TOKEN` as a GitHub repository secret. The `deploy-preview.yml` and `deploy-production.yml` workflows will handle preview and production deploys automatically.

### Netlify

1. Push your repo to GitHub.
2. Import the project at [app.netlify.com](https://app.netlify.com).
3. Set environment variables in the Netlify dashboard.
4. Build settings are configured in `netlify.toml` (build command: `npm run build`, publish directory: `.next`).
5. Security headers are configured in `netlify.toml`.

For CI-driven deployments, add `NETLIFY_AUTH_TOKEN` as a GitHub repository secret. The same deploy workflows support Netlify as an alternative to Vercel.

## CI/CD Workflows

All workflows live in `.github/workflows/`. Optional integrations use a secret-guard pattern — when the required secret is missing, the job is skipped with a neutral status and a skip-notice is logged.

| Workflow                | Trigger             | Secret Guard                                    | Description                                                                                                                                                 |
| ----------------------- | ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                | Push, PR            | —                                               | Lint (ESLint), format check (Prettier), test (Vitest) with coverage. Uploads to Codecov when `CODECOV_TOKEN` is set.                                        |
| `security.yml`          | PR, weekly schedule | `TRIVY_ENABLED`, `SNYK_TOKEN`, `SAFETY_API_KEY` | Runs Trivy, Snyk, and Safety CLI security scans. Each scanner is independently guarded. Fails on critical/high findings.                                    |
| `lighthouse.yml`        | PR                  | `LHCI_GITHUB_APP_TOKEN`                         | Lighthouse CI performance, accessibility, best practices, and SEO checks against configurable thresholds.                                                   |
| `deploy-preview.yml`    | PR                  | `VERCEL_TOKEN` or `NETLIFY_AUTH_TOKEN`          | Deploys PR branches to a preview URL on the configured platform.                                                                                            |
| `deploy-production.yml` | Push to main        | `VERCEL_TOKEN` or `NETLIFY_AUTH_TOKEN`          | Deploys the main branch to production.                                                                                                                      |
| `sonarqube.yml`         | PR, push to main    | `SONAR_TOKEN`                                   | SonarQube code quality and security analysis.                                                                                                               |
| `qlty.yml`              | PR                  | `QLTY_TOKEN`                                    | qlty.sh code quality analysis.                                                                                                                              |
| `a11y.yml`              | PR                  | —                                               | axe-core accessibility testing. Fails on WCAG 2.1 Level AA violations.                                                                                      |
| `stale.yml`             | Daily schedule      | —                                               | Calls reusable stale bot workflow from `LUSKTECH/.github`. Labels issues inactive for 30 days, closes after 7 more. Exempts `pinned` and `security` labels. |
| `automerge.yml`         | PR (Dependabot)     | —                                               | Auto-merges Dependabot patch/minor PRs when all checks pass.                                                                                                |
| `discord-notify.yml`    | Workflow run        | `DISCORD_WEBHOOK_URL`                           | Calls reusable Discord notification workflow from `LUSKTECH/.github`. Sends formatted embeds on CI events.                                                  |

### Reusable Workflows

This template references reusable workflows from the [`LUSKTECH/.github`](https://github.com/LUSKTECH/.github) repository:

- **`reusable-discord-notify.yml`** — Sends formatted Discord embeds with build/deploy status
- **`reusable-stale.yml`** — Labels and closes stale issues/PRs with configurable thresholds
- **`reusable-security-scan.yml`** — Runs Trivy, Snyk, or Safety CLI scans with shared configuration

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes — pre-commit hooks will run ESLint, Prettier, and commitlint automatically.
3. Write or update tests for your changes.
4. Ensure all tests pass: `npm run test:run`
5. Open a pull request using the PR template.

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are validated by commitlint via a Husky `commit-msg` hook.

```text
feat(cookie): add marketing consent toggle
fix(seo): correct canonical URL generation
docs: update deployment instructions
chore(deps): bump next to 16.1.6
```

### Code Quality

- **ESLint** enforces code style and catches common issues
- **Prettier** ensures consistent formatting
- **Husky** runs pre-commit hooks for lint-staged and commitlint
- **Vitest** with fast-check provides unit and property-based test coverage

## Project Structure

```text
├── .github/
│   ├── workflows/          # CI/CD workflow files
│   ├── ISSUE_TEMPLATE/     # Bug report, feature request, question templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   ├── FUNDING.yml
│   └── dependabot.yml
├── public/                 # Static assets (favicons, robots.txt, manifest)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── privacy/        # Privacy Policy page
│   │   ├── terms/          # Terms of Service page
│   │   ├── layout.tsx      # Root layout with cookie banner
│   │   ├── not-found.tsx   # Custom 404 page
│   │   ├── error.tsx       # Custom 500 page
│   │   └── sitemap.ts      # Auto-generated sitemap
│   ├── components/         # React components (SEO, CookieBanner, CookiePreferences)
│   └── lib/                # Utilities (env validation, analytics, Axiom, Sentry, CSP, cookie consent)
├── __tests__/              # Test files
│   ├── unit/               # Unit tests
│   └── properties/         # Property-based tests (fast-check)
├── vercel.json             # Vercel deployment config + security headers
├── netlify.toml            # Netlify deployment config + security headers
├── vitest.config.ts        # Vitest configuration
├── lighthouserc.js         # Lighthouse CI thresholds
├── codecov.yml             # Codecov coverage thresholds
├── sonar-project.properties # SonarQube project config
├── .qlty.toml              # qlty.sh quality gates
└── .env.example            # Environment variable reference
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Repobeats

![Repobeats analytics image](https://repobeats.axiom.co/api/embed/PLACEHOLDER_REPOBEATS_ID.svg 'Repobeats analytics image')

## AI Usage Disclaimer

Portions of this codebase were generated with the assistance of Large Language Models (LLMs). All AI-generated code has been reviewed and tested to ensure quality and correctness.
