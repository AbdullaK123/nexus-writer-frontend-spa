# Nexus Writer Frontend

React SPA for **Nexus Writer**, a story-writing application with a rich chapter editor, story organization, background analysis, real-time notifications, and grounded AI story chat.

The backend lives in a separate repository: [AbdullaK123/nexus-writer-backend](https://github.com/AbdullaK123/nexus-writer-backend).

## Product surface

The current SPA includes:

- authenticated login/signup flows with protected application routes
- a user dashboard and recent-writing navigation
- story creation and story detail views
- ordered chapter navigation and drag/reorder interactions
- a Tiptap-based chapter editor with autosave behavior
- chapter comments/analysis surfaced from backend jobs
- story-scoped AI chat with persisted threads and streamed responses
- account/editor/notification settings
- application notifications over Server-Sent Events with reconnect handling
- dedicated error and not-found routes

## Tech stack

- **React 19**
- **TypeScript 6**
- **Vite 8**
- **TanStack Router** for typed application routing
- **TanStack Query** for server-state ownership and cache invalidation
- **Tiptap 3** for the writing editor
- **Ark UI** for headless UI primitives
- **dnd-kit** for drag/reorder interactions
- **Zod** for runtime validation
- **React Hook Form** for forms
- **Oxide.ts** for explicit `Option`/`Result` style values
- **eventsource-parser** for SSE streaming
- **Recharts / d3-delaunay** for visualization-oriented UI
- **Vitest + Testing Library** for unit/integration tests
- **Playwright** for adversarial end-to-end tests

Node requirement: **>= 20.19**. CI currently runs on Node 24.

## Frontend architecture

The frontend is organized by feature rather than by generic React file type.

```text
src/
├── AppRouter.tsx           # app-level auth/theme/notification orchestration
├── router.tsx              # TanStack route tree + auth boundaries
├── components/
│   ├── auth/
│   ├── chapter/
│   ├── chat/
│   ├── common/
│   ├── providers/
│   ├── settings/
│   └── story/
├── data/                   # queries, mutations, providers, server-state access
├── hooks/                  # shared hooks
├── infrastructure/         # API client, config, SSE, auth-routing helpers
└── shared/                 # reusable types/utilities
```

Tests are kept outside `src`:

```text
tests/
├── helpers/
├── integration/
└── unit/

e2e/                       # real frontend + real backend Playwright tests
```

### Component ownership

The UI follows a simple ownership rule:

```text
application concerns -> application boundary
cross-feature concerns -> page/nearest common parent
feature-local concerns -> feature component
rendering -> dumb view/child components
```

Page and feature-level hooks orchestrate the state needed by their subtree and return explicit child prop contracts. For example, the chapter editor page itself is mostly composition: its page hook prepares the sidebar/editor/comments contracts and the component renders those children.

Where a component has distinct legal render states, props are modeled with discriminated unions instead of piles of unrelated booleans/optional values. The goal is to make rendering boring: application state is interpreted before it reaches the view, and the view renders an explicit contract.

This pattern scales recursively from page-level features down to small feature components without forcing every tiny presentational component to own hooks or application knowledge.

## Routing

TanStack Router defines public and authenticated route boundaries.

Current major routes include:

```text
/login
/signup
/error
/404

/                              # authenticated dashboard
/stories/$storyId
/stories/$storyId/$chapterId   # chapter editor
/stories/$storyId/chat/new
/stories/$storyId/chat/$threadId
/settings
```

Protected routes redirect unauthenticated users to `/login` and preserve the original destination for post-login navigation.

## Server state and real-time updates

TanStack Query owns backend-derived server state. Mutations invalidate or refresh the narrow query keys whose canonical data changed instead of maintaining a second independent copy of backend truth.

The app also opens an authenticated SSE notification stream. Backend events such as scene extraction, analysis completion, comments readiness, and job failures drive user toasts and targeted query invalidation. The stream has explicit abort ownership and bounded reconnect behavior.

## Configuration

Frontend runtime configuration is validated with Zod at startup.

Create a `.env` file in the repository root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT_MS=10000
```

Both values are required. `VITE_API_BASE_URL` must be a valid URL and `VITE_API_TIMEOUT_MS` must be a positive integer.

The backend must allow the frontend origin through CORS and allow credentials because Nexus Writer uses an HttpOnly session cookie.

## Run locally

Install dependencies:

```bash
npm ci
```

Start the Vite development server:

```bash
npm run dev
```

By default Vite serves the app at `http://localhost:5173`.

The backend should be running separately, normally at `http://localhost:8000` with the frontend configured to use `http://localhost:8000/api`.

## Available scripts

```bash
npm run dev          # Vite dev server
npm run build        # TypeScript build + production Vite build
npm run lint         # ESLint
npm test             # Vitest once
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright adversarial E2E suite
npm run preview      # preview production build
```

## Testing philosophy

Tests focus on observable behavior and production invariants rather than implementation details.

### Unit and integration tests

Run:

```bash
npm test
```

The suite covers pure helpers, API/SSE behavior, state ownership, auth routing, UI behavior, and integration boundaries.

Pull requests to `main` run:

```text
npm ci
-> TypeScript typecheck
-> ESLint
-> Vitest
```

### Adversarial E2E tests

The `e2e/` suite runs the real React frontend against the real FastAPI backend. It deliberately focuses on deterministic application behavior rather than AI-provider output.

Coverage includes invariants such as:

- account/session isolation
- auth transitions
- nested-resource ownership
- autosave races
- navigation while saves are in flight
- offline save behavior
- delete/reorder consistency
- stale SSE/cache behavior

The Playwright dependency is currently documented separately rather than included in `package.json`. For a fresh checkout:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Start PostgreSQL, Redis, migrations, and the backend API first. Playwright starts the Vite frontend automatically.

Then run:

```bash
npm run test:e2e
```

Defaults:

```text
frontend: http://localhost:5173
backend:  http://localhost:8000/api
```

Override them when needed:

```bash
E2E_FRONTEND_URL=http://localhost:5173 \
E2E_API_BASE_URL=http://localhost:8000/api \
npm run test:e2e
```

The current GitHub Actions frontend workflow runs typecheck, lint, and Vitest. The Playwright suite is maintained separately and is not yet part of that CI workflow.

## Backend dependency

The SPA expects the Nexus Writer FastAPI backend for authentication, stories, chapters, search, comments/analysis, chat, settings, and SSE notifications.

Backend repository:

**https://github.com/AbdullaK123/nexus-writer-backend**

For local development, run the backend first and point:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

at it.
