# type-words

type-words is an English typing practice project built with React and TypeScript. The app currently displays a chalkboard-inspired top screen titled 「英語タイピング」 with a start button.

## Architecture

The app is a fully client-side React SPA, with no backend, database, or authentication. It uses React state without React Router.

```mermaid
flowchart LR
    User["User"] -->|"HTTPS"| Pages["Cloudflare Pages"]
    Pages --> SPA["React SPA in the browser"]
    Repo["GitHub Repository"] --> Git["Cloudflare Pages Git Integration"]
    Git -->|"main branch deployment"| Pages
```

Cloudflare Pages Git integration handles production deployment from `main`. GitHub Actions handles quality checks.

## Project structure

- `src/`: React and TypeScript UI components and styles
- `public/`: Favicons and Web App Manifest
- `test/`: Tests using Vitest and React Testing Library
- `index.html`: HTML entry point
- `vite.config.ts`: Vite and test configuration
- `biome.json`: Linting and formatting configuration
- `mise.toml`: Pinned Node.js version
- `.github/workflows/pr-checks.yml`: Pull request checks

## First-time setup

Install [mise](https://mise.jdx.dev/getting-started.html) and activate it in your shell, then run:

```sh
git clone https://github.com/kazuy/type-words.git
cd type-words
mise trust
mise install
node --version
npm ci
```

Confirm that `node --version` matches `mise.toml`. npm is bundled with Node.js.

## Local development

```sh
npm run dev
```

Open the local URL printed by Vite in your browser.

## Checks and formatting

```sh
npm run lint
npm test
npm run build
```

Use `npm run format` to format files and `npm run test:watch` to run tests in watch mode. The lint command checks files without modifying them.

Production builds are written to `dist/`. Run `npm run preview` after building to preview the result locally.

GitHub Actions runs lint, tests, and build on pull requests targeting `main`. When changing Node.js versions, update both `mise.toml` and the CI workflow.
