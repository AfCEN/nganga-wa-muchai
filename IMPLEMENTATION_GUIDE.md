# Nganga wa Muchai — Implementation Guide

## What This App Is

A family history archive for the Nganga wa Muchai family. It lets family members explore an interactive family tree graph, read stories, browse a timeline of events, and follow curated "story trails" through family history. Anyone in the family can contribute people, connections, stories, and events through a modal form.

---

## Architecture

```
React Frontend (Vercel/Netlify)
    ↓ REST API calls + JWT auth
FastAPI Backend (Railway)
    ├── Neo4j AuraDB        → family data (people, connections, stories, events, trails)
    ├── Google Cloud Storage → photo/file uploads
    └── Custom Auth (JWT)    → signup, login, token refresh, password reset
```

| Service | Purpose | Hosting | Free Tier |
|---------|---------|---------|-----------|
| **React Frontend** | UI | Vercel or Netlify (already configured) | Yes |
| **FastAPI** | Backend server + custom auth | Railway | Yes (500 hrs/month) |
| **Neo4j AuraDB** | Graph database for family data | Neo4j Cloud | Yes (free instance) |
| **Google Cloud Storage** | Photo/file storage | Google Cloud | 5GB free |

No Firebase dependency. Authentication is fully custom using FastAPI + JWT + bcrypt.

---

## Current State: What Exists and Works

### Frontend (Complete)

Every page and component is fully built and styled:

| Component | File | Status |
|-----------|------|--------|
| App shell + routing | `src/App.jsx` | 4 routes working: `/`, `/timeline`, `/stories`, `/trails` |
| Navigation | `src/components/Navbar.jsx` | Desktop + mobile responsive, live stats, active link highlighting |
| Landing hero | `src/components/LandingHero.jsx` | Animated counters, scroll-to-graph CTA |
| Family graph | `src/components/FamilyGraph.jsx` | Canvas-based d3-force graph with pan, zoom, drag, hover, click selection |
| Person detail | `src/components/PersonCard.jsx` | Slide-in sidebar with bio, connections, linked stories |
| Timeline | `src/components/Timeline.jsx` | Chronological events, alternating layout, filter by person/type |
| Story cards | `src/components/StoryCard.jsx` | Grid cards with expandable modal, type badges, tags, linked people |
| Story trails | `src/components/StoryTrails.jsx` | Trail cards + full-screen sequential reader with progress bar |
| Contribute modal | `src/components/ContributeModal.jsx` | Tabbed forms for adding people, stories, connections, events |
| Styling | `src/index.css` | Full design system with CSS variables, responsive breakpoints, animations |

### Data Layer (Needs Replacement)

| Piece | File | Status |
|-------|------|--------|
| State management | `src/data/store.jsx` | **Rewired** — React Context + useReducer with optimistic API updates. Falls back to seed data if API unavailable. |
| API client | `src/data/api.js` | **New** — fetch wrapper with JWT auth header support, base URL from `VITE_API_URL`. |
| Seed data | `src/data/seedData.js` | Only the patriarch exists. Used as fallback when API is unavailable. |
| Firebase config | `src/firebase.js` | **Deleted** — no Firebase dependency. |

### Deployment Config (Complete)

- `netlify.toml` — build command, publish dir, SPA redirect
- `vercel.json` — SPA rewrite rule
- `vite.config.js` — React + Tailwind plugins, dev server on port 5174

---

## What Doesn't Work / Is Missing

### 1. No Shared Data — localStorage Is Per-Browser

**Problem:** The store reads and writes to `localStorage`. Every user sees only their own data. If Person A adds a family member, Person B never sees it.

**Impact:** The entire collaborative premise of the app is broken. The "Contribute" feature only contributes to your own browser.

### 2. No Backend API

**Problem:** There is no server. The frontend has no way to persist data to a shared database or retrieve it. Firebase was wired up but never used for data operations.

**Impact:** The app is a single-user local tool, not a collaborative platform.

### 3. No Graph Database

**Problem:** Family data is stored as flat arrays in localStorage. Relationship queries (e.g., "find all descendants", "how are two people related?") require manual traversal.

**Impact:** The app can't leverage the graph nature of family data. As the tree grows, queries get slower and more complex.

### 4. No Authentication

**Problem:** There is no auth system. No login/signup, no user tracking, no permissions. The `author` field on stories is just a free-text input.

**Impact:** Anyone with the URL could add/edit/delete data with no accountability.

### 5. No Photo Upload

**Problem:** The person data model has a `photo` field (always `null`). PersonCard renders an initials avatar as fallback, but there's no upload flow or storage backend.

**Impact:** The family tree is text-only. No photos of ancestors or family members.

### 6. Empty Seed Data

**Problem:** Only the patriarch node exists. The graph shows a single dot. The timeline, stories, and trails pages are all empty.

**Impact:** New visitors see a nearly blank app with no sense of what it could be.

### 7. No Data Validation or Moderation

**Problem:** The ContributeModal accepts whatever is typed and writes it directly to the store. No duplicate detection, moderation, edit/delete, or undo.

**Impact:** Data quality will degrade quickly once multiple people contribute.

### 8. Minor Bugs and UX Issues

- **ContributeModal `initialTab` prop is ignored** — always starts on "person" tab
- **ID collisions** — IDs generated with `Date.now()`, rapid submissions could collide
- **Form state doesn't reset** — previous values persist after submit
- **No loading states or error feedback**

---

## Implementation Plan: What to Change

### Phase 1: Backend API + Neo4j (FastAPI on Railway)

This is the most critical change. Without a shared backend, the app has no purpose.

#### 1A. Set Up Neo4j AuraDB

- [ ] Create a free Neo4j AuraDB instance at console.neo4j.io
- [ ] Note the connection URI, username, and password
- [ ] Define the graph schema:

```cypher
// Node labels
(:Person {id, name, birthYear, deathYear, generation, location, bio, role, photo, createdBy, createdAt, updatedAt})
(:Story {id, title, content, author, type, date, tags, createdBy, createdAt, updatedAt})
(:Event {id, title, description, year, type, createdBy, createdAt})
(:StoryTrail {id, title, description, createdBy, createdAt})
(:User {id, email, hashedPassword, displayName, role, createdAt})

// Relationship types
(:Person)-[:PARENT_OF]->(:Person)
(:Person)-[:SPOUSE_OF]->(:Person)
(:Person)-[:SIBLING_OF]->(:Person)
(:Person)-[:APPEARS_IN]->(:Story)
(:Person)-[:APPEARS_IN]->(:Event)
(:Story)-[:PART_OF_TRAIL {order: int}]->(:StoryTrail)
(:User)-[:CREATED]->(:Person|:Story|:Event|:StoryTrail)
```

#### 1B. Build the FastAPI Backend

- [x] Initialize a new `server/` directory with FastAPI project structure
- [x] Install dependencies: `fastapi`, `uvicorn`, `neo4j`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`, `google-cloud-storage`
- [x] Create Neo4j driver connection (`server/db.py`)
- [x] Create Pydantic models for request/response validation (`server/models/`)
- [ ] Create API routes:

```
# Auth
POST   /api/auth/signup          → register new user (email, password, display name)
POST   /api/auth/login           → login, returns access + refresh JWT tokens
POST   /api/auth/refresh         → refresh expired access token
GET    /api/auth/me              → current user profile
PUT    /api/auth/me              → update profile (display name, password)

# People
GET    /api/people               → all people (nodes)
GET    /api/people/{id}          → single person + connections
POST   /api/people               → create person
PUT    /api/people/{id}          → update person
DELETE /api/people/{id}          → delete person

# Connections
GET    /api/connections          → all connections (edges)
POST   /api/connections          → create connection
DELETE /api/connections/{id}     → delete connection

# Stories
GET    /api/stories              → all stories
GET    /api/stories/{id}         → single story
POST   /api/stories              → create story
PUT    /api/stories/{id}         → update story
DELETE /api/stories/{id}         → delete story

# Events
GET    /api/events               → all events
POST   /api/events               → create event
PUT    /api/events/{id}          → update event
DELETE /api/events/{id}          → delete event

# Trails
GET    /api/trails               → all story trails
GET    /api/trails/{id}          → single trail with stories
POST   /api/trails               → create trail
PUT    /api/trails/{id}          → update trail
DELETE /api/trails/{id}          → delete trail

# Graph
GET    /api/graph                → full graph (nodes + edges) for d3 visualization
GET    /api/people/{id}/path/{target_id} → find relationship path between two people

# Upload
POST   /api/upload               → upload photo to GCS, returns URL
```

- [ ] Add JWT auth middleware (decode token, inject current user into request)
- [x] Add CORS configuration for the frontend origin
- [x] Add input validation via Pydantic models

#### 1C. Deploy API to Railway

- [ ] Create a Railway project
- [x] Add `Dockerfile` or `Procfile` for Railway deployment
- [ ] Add environment variables: `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `JWT_SECRET`, `GCS_BUCKET`, `GCS_CREDENTIALS`
- [ ] Deploy the FastAPI server
- [ ] Note the Railway public URL for frontend config

#### 1D. Rewire the Frontend Store

- [x] Replace localStorage reads/writes with `fetch()` calls to the FastAPI backend
- [x] Add `VITE_API_URL` env var pointing to Railway URL
- [x] Keep the store's public API (`addPerson`, `getPersonById`, etc.) the same
- [x] Add loading and error states to the store context
- [x] Add optimistic updates for better UX (update UI immediately, sync in background)

#### 1E. Remove Firebase

- [x] Delete `src/firebase.js`
- [x] Remove `firebase` from `package.json` dependencies
- [x] Remove all Firebase imports from the codebase

### Phase 2: Custom Authentication (FastAPI + JWT)

#### 2A. Auth Backend (in FastAPI)

- [ ] User model stored as `:User` nodes in Neo4j (email, hashed password, display name, role)
- [ ] Password hashing with `bcrypt` via `passlib`
- [ ] JWT access tokens (short-lived, 15-30 min) + refresh tokens (long-lived, 7 days)
- [ ] Token endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`
- [ ] Protected route dependency: `get_current_user()` extracts user from JWT
- [ ] Role-based access: `member` (default) and `admin`

#### 2B. Auth Frontend

- [ ] Create `src/data/auth.jsx` — AuthProvider context with login/signup/logout/token refresh
- [ ] Store JWT tokens in `httpOnly` cookies or localStorage (with refresh flow)
- [ ] Create `src/components/LoginPage.jsx` — email/password signup + login forms
- [ ] Protect routes — redirect unauthenticated users to login
- [ ] Show current user in Navbar (display name, logout button)
- [ ] Attach JWT token to every API request as `Authorization: Bearer <token>`
- [ ] Auto-refresh expired tokens using the refresh token

#### 2C. Attach Identity to Contributions

- [ ] Backend auto-fills `createdBy` from the authenticated user's ID on every write
- [ ] Replace the free-text "author" field on stories with the user's display name
- [ ] Show "Added by [name]" on person cards, stories, events

### Phase 3: Photo Upload (Google Cloud Storage)

#### 3A. Set Up GCS

- [ ] Create a Google Cloud Storage bucket
- [ ] Configure CORS on the bucket for the frontend origin
- [ ] Create a service account with storage write permissions
- [ ] Add service account credentials to Railway env vars

#### 3B. Implement Upload Flow

- [ ] Add `POST /api/upload` endpoint to FastAPI (using `python-multipart` + `google-cloud-storage`)
- [ ] Frontend sends photo to API → API uploads to GCS → returns public URL
- [ ] Store the URL on the Person node in Neo4j
- [ ] Add photo upload to AddPersonForm and PersonCard
- [ ] Show actual photos instead of initials avatars

#### 3C. Image Handling

- [ ] Resize/compress on client before upload (keep under 1MB)
- [ ] Support basic crop for portrait framing
- [ ] Add a placeholder/loading state while images load

### Phase 4: Seed Meaningful Data

#### 4A. Populate Seed Data

Load real family data into Neo4j (via Cypher script or the API):

- [ ] At minimum: 2-3 generations of known family members with connections
- [ ] A few founding stories or oral history excerpts
- [ ] Key timeline events (births, marriages, migrations, milestones)
- [ ] One example story trail

#### 4B. Add an Onboarding Flow

- [ ] First-time visitors see a brief walkthrough of how to use the graph
- [ ] Prompt authenticated users to "Add yourself to the tree" as their first action

### Phase 5: Data Quality and Moderation

#### 5A. Edit and Delete

- [ ] Add edit buttons to PersonCard, StoryCard, Timeline events
- [ ] Add delete with confirmation dialog
- [ ] Only allow creators (or admins) to edit/delete their own entries

#### 5B. Duplicate Detection

- [ ] When adding a person, search existing names and warn if a close match exists
- [ ] Suggest linking to an existing person instead of creating a duplicate

#### 5C. Admin Role

- [ ] Admin users set via `role: "admin"` on the User node in Neo4j
- [ ] Admins can edit/delete any entry, merge duplicates, curate story trails
- [ ] Admin panel for managing users and content

#### 5D. Graph-Powered Features (Neo4j Advantage)

- [ ] "How are we related?" — find shortest path between two people
- [ ] "Family of [person]" — show subtree of descendants/ancestors
- [ ] Suggest missing connections based on graph patterns

### Phase 6: Bug Fixes and Polish

- [ ] Fix `initialTab` prop ignored in ContributeModal — read prop and set as default state
- [ ] Fix ID collisions with `Date.now()` — use `crypto.randomUUID()` or Neo4j-generated IDs
- [ ] Fix form state persists after submit — reset in `onSubmit` handler after successful save
- [ ] Add loading spinners during async API operations
- [ ] Add toast/notification system for success/error feedback
- [ ] Add a catch-all 404 route for unknown paths

---

## Priority Order

| Priority | Phase | Why |
|----------|-------|-----|
| **P0** | Phase 1 (FastAPI + Neo4j) | Without shared data, the app is a single-user toy |
| **P0** | Phase 2 (Custom Auth) | Can't have shared writes without identity |
| **P1** | Phase 4 (Seed data) | Empty app won't attract contributors |
| **P1** | Phase 6 (Bug fixes) | Small effort, big UX improvement |
| **P2** | Phase 3 (Photos) | Important for a family tree, but not blocking |
| **P2** | Phase 5 (Moderation + graph features) | Needed once multiple people are contributing |

---

## Files That Need Changes

### Frontend (existing)

| File | Changes |
|------|---------|
| `src/data/store.jsx` | **Major rewrite** — replace localStorage with `fetch()` calls to FastAPI backend |
| `src/firebase.js` | **Delete** — no longer needed, auth is custom |
| `src/data/seedData.js` | Can be removed once Neo4j is populated; or keep as fallback |
| `src/components/ContributeModal.jsx` | Fix `initialTab`, add `createdBy` field, reset forms, better IDs |
| `src/components/PersonCard.jsx` | Add edit button, photo display, "added by" attribution |
| `src/components/StoryCard.jsx` | Add edit/delete buttons |
| `src/components/Timeline.jsx` | Add edit/delete for events |
| `src/components/Navbar.jsx` | Add user avatar / login-logout button |
| `src/App.jsx` | Add AuthProvider wrapper, protected routes, login route |
| `src/main.jsx` | Wrap with AuthProvider |
| `package.json` | Remove `firebase` dependency |

### New frontend files

| File | Purpose |
|------|---------|
| `src/components/LoginPage.jsx` | Signup + login forms (email/password) |
| `src/data/auth.jsx` | AuthProvider context, JWT token management, login/signup/logout/refresh |
| `src/data/api.js` | API client helper — base URL, auth headers, error handling |
| `.env` | `VITE_API_URL` (do not commit) |

### New backend files (server/)

| File | Purpose |
|------|---------|
| `server/requirements.txt` | fastapi, uvicorn, neo4j, python-jose, passlib, python-multipart, google-cloud-storage |
| `server/main.py` | FastAPI app entry point, CORS, router includes |
| `server/config.py` | Settings via environment variables (pydantic-settings) |
| `server/db.py` | Neo4j async driver connection setup |
| `server/models/user.py` | User Pydantic models (signup, login, response) |
| `server/models/person.py` | Person Pydantic models |
| `server/models/story.py` | Story Pydantic models |
| `server/models/event.py` | Event Pydantic models |
| `server/models/connection.py` | Connection Pydantic models |
| `server/models/trail.py` | StoryTrail Pydantic models |
| `server/auth.py` | JWT creation/verification, password hashing, `get_current_user` dependency |
| `server/routes/auth.py` | Signup, login, refresh, profile endpoints |
| `server/routes/people.py` | People CRUD + graph queries |
| `server/routes/connections.py` | Connection CRUD |
| `server/routes/stories.py` | Stories CRUD |
| `server/routes/events.py` | Events CRUD |
| `server/routes/trails.py` | Story trails CRUD |
| `server/routes/upload.py` | Photo upload to GCS |
| `server/routes/graph.py` | Full graph endpoint + path-finding queries |
| `server/Dockerfile` | Container config for Railway deployment |
| `server/.env` | `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `JWT_SECRET`, `GCS_BUCKET`, `GCS_CREDENTIALS` |
| `server/seed.cypher` | Cypher script to populate initial family data |
