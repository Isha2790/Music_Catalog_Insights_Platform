# Music Catalog Insights Platform
 
A full-stack web app that lets a user search the public iTunes music catalog,
save albums to a personal library, explore analytics on that library, and get
AI-generated insights into their taste.
 
Built for the "Music Catalog Insights Platform" take-home assignment.
 
---
 
## 1. Entity focus: **Albums**
 
I chose **Albums** as the catalog entity for three reasons:
 
1. Albums carry the richest metadata in the iTunes API for this use case —
   genre, release date, track count, artwork, price — which makes the
   analytics dashboard (genre spread, release-year trends, decade histograms)
   meaningfully richer than it would be for a bare song or artist search.
2. A personal "library" maps naturally onto album collecting — it mirrors how
   people actually think about owning music (crates, shelves, playlists of
   albums), which made the product decisions (rating, notes) feel grounded
   rather than arbitrary.
3. Songs would have produced a much larger, noisier result set per search
   with less differentiating metadata; artists would have made the "library"
   concept awkward (you don't rate an artist the way you rate a record).
---
 
## 2. Architecture
 
```
music-catalog-insights/
├── backend/     Spring Boot 3 (Java 17) REST API
├── frontend/    Next.js 14 (App Router) + Tailwind + Framer Motion + Recharts
└── docs/        SQL schema reference
```
 
**Backend responsibilities**
- Proxies and normalizes iTunes Search API results (`GET /api/search`)
- Owns the user's personal library in its own database (full CRUD)
- JWT-based authentication (register/login)
- Centralized exception handling → consistent JSON error shape
- Analytics aggregation (`GET /api/analytics`)
- AI insight generation (`GET /api/insights`)
**Frontend responsibilities**
- Search page with debounced input against the backend's search proxy
- Library page with inline star-rating and notes editing
- Analytics dashboard with 5 charts (donut, line, bar, horizontal bar, histogram)
- AI Insights panel rendered above the charts
- JWT session stored client-side, attached to every request via an axios interceptor
Frontend and backend are deployed as two separate services (see Section 8) —
Vercel hosts the Next.js frontend, and Render hosts the Spring Boot backend
plus its Postgres database.
 
---
 
## 3. Database & schema
 
**Choice: relational (PostgreSQL in production, H2 in-memory for local dev)**
 
Justification: the data is small, strongly typed, and has a clear 1-to-many
relationship (user → library items) with uniqueness constraints (a user can't
save the same album twice) that a relational database enforces natively and
cheaply. There's no need for flexible/nested documents or high write
throughput that would justify a NoSQL store here.
 
```sql
CREATE TABLE app_user (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
 
CREATE TABLE library_item (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    apple_catalog_id  BIGINT NOT NULL,
    title             VARCHAR(500) NOT NULL,
    artist_name       VARCHAR(500) NOT NULL,
    genre             VARCHAR(200),
    release_date      DATE,
    track_count       INTEGER,
    artwork_url       VARCHAR(1024),
    collection_price  DOUBLE PRECISION,
    user_rating       INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_notes        VARCHAR(2000),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, apple_catalog_id)
);
```
 
Full DDL also lives in `docs/schema.sql`. In dev, Hibernate's
`ddl-auto=update` creates this automatically against an in-memory H2 database
— no external DB needed to run the project locally.
 
---
 
## 4. REST API
 
All endpoints are prefixed with `/api`. Protected endpoints require
`Authorization: Bearer <jwt>`.
 
| Method | Path                | Auth | Description |
|--------|---------------------|------|--------------|
| POST   | `/auth/register`    | No   | Create an account, returns a JWT |
| POST   | `/auth/login`       | No   | Log in, returns a JWT |
| GET    | `/search`           | No   | Proxy search against the iTunes catalog |
| GET    | `/library`          | Yes  | List the current user's saved albums |
| POST   | `/library`          | Yes  | Save an album to the library |
| PUT    | `/library/{id}`     | Yes  | Update rating/notes on a saved album |
| DELETE | `/library/{id}`     | Yes  | Remove an album from the library |
| GET    | `/analytics`        | Yes  | Aggregated stats for charts |
| GET    | `/insights`         | Yes  | AI-generated trend summary |
| GET    | `/health`           | No   | Health check for deploy platforms |
 
Validation errors return `400` with a `fieldErrors` array; not-found returns
`404`; duplicate saves return `409`; upstream iTunes failures return `502` —
all via a single `GlobalExceptionHandler` so the shape is always predictable:
 
```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/library",
  "fieldErrors": [{ "field": "title", "message": "title is required" }]
}
```
 
---
 
## 5. AI feature: Trend Summary & Recommendations
 
**Design decision:** the insight engine (`AiInsightService`) is a
deterministic, rule-based analyzer by default — it reads the user's saved
library and writes natural-language observations (dominant genre, era,
ratings, most-collected artist, track-length habits) plus a few tailored
recommendations. This was chosen over a hard dependency on a paid LLM API
for three reasons: it needs zero external API keys to run or grade, it has
zero latency/cost, and its logic is fully inspectable and testable
(see `AnalyticsServiceTest`).
 
The service is architected so a real LLM can be dropped in without touching
the frontend: if `AI_PROVIDER_API_KEY` and `AI_PROVIDER_URL` are set, the
service asks the LLM (`LlmClient`) to narrate the same structured stats
instead, and falls back to the heuristic engine automatically if that call
fails. Both paths return the same `InsightResponse` shape.
 
---
 
## 6. Trade-offs & what I'd do with more time
 
- **Auth**: JWT is stored in `localStorage` for simplicity; a production app
  would use an httpOnly cookie to reduce XSS exposure.
- **iTunes rate limits**: search results are cached server-side (Caffeine,
  10 min TTL) to reduce redundant upstream calls, but there's no per-user
  rate limiting on our own `/api/search` endpoint yet.
- **AI feature**: the heuristic engine is explainable and free, but a real
  LLM integration would produce more varied, less template-shaped prose —
  the `LlmClient` hook is there but intentionally left unwired to a specific
  provider's response schema.
- **Testing**: only the analytics aggregation has unit tests; controller and
  security-layer integration tests would be the next thing added.
- **Pagination**: the library list currently returns everything in one call;
  fine at demo scale, but would need pagination for a heavier collection.
- **Deployment topology**: splitting the frontend (Vercel) and backend
  (Render) across two platforms is the right call for a Java + Next.js stack,
  but it means two separate places for config/env drift to hide — see the
  troubleshooting note below.
---
 
## 7. Running locally
 
### Backend
Requires Java 17+ and Maven.
 
```bash
cd backend
mvn spring-boot:run
```
 
Runs on `http://localhost:8080` with an in-memory H2 database (`dev` profile
is active by default — no setup needed). H2 console: `/h2-console`
(JDBC URL `jdbc:h2:mem:musiccatalog`, user `sa`, blank password).
 
### Frontend
Requires Node 18+.
 
```bash
cd frontend
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm run dev
```
 
Runs on `http://localhost:3000`.
 
---
 
## 8. Deployment
 
**Backend (Render / Railway):**
1. Push `backend/` as its own service (or point the platform's root dir to `backend`).
2. Set `SPRING_PROFILES_ACTIVE=prod`.
3. Provision a PostgreSQL instance and set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`.
   - Note: Render's Postgres "External/Internal Connection String" is given
     in `postgres://user:pass@host:port/db` form — Spring Boot's JDBC driver
     needs `jdbc:postgresql://host:port/db`, so double-check the scheme
     before pasting it in.
4. Set `JWT_SECRET` to a long random string.
5. Set `CORS_ALLOWED_ORIGINS` to your deployed frontend's URL (exact scheme
   and host, no trailing slash).
6. See `backend/src/main/resources/application-example.properties` for the full list.
**Frontend (Vercel / Netlify):**
1. Point the platform at `frontend/`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend's `/api` URL.
3. Deploy — build command `npm run build`, output is the default Next.js build.
   Remember `NEXT_PUBLIC_*` vars are baked in at build time, so a redeploy is
   required any time this value changes.
**Troubleshooting note:** because this app spans two independently-deployed
services, a `502` from `/api/search` in production almost always traces back
to one of: the backend not being live yet (Render cold start), a malformed
`DATABASE_URL` preventing the backend from booting, or `NEXT_PUBLIC_API_BASE_URL`
on Vercel not (yet) pointing at the live backend. Checking the backend's own
`/api/health` endpoint directly is the fastest way to isolate which side is at fault.
 
---
 
## 9. Tech stack
 
- **Backend**: Java 17, Spring Boot 3.3, Spring Security (JWT via `jjwt`), Spring Data JPA, PostgreSQL / H2, Caffeine cache
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Recharts, Axios, lucide-react
- **Third-party data**: Base Endpoint (iTunes Search): https://itunes.apple.com/search — free, public, no key required
