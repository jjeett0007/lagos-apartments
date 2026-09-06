# Eko Space

Lagos accommodation discovery with inspectable room measurements. Built with Next.js 16 App Router, Bun, PostgreSQL, Prisma 7, and Better Auth.

## Local setup

1. Install dependencies with `bun install`. This generates the Prisma client.
2. Open `.env` and paste your PostgreSQL connection string into `DATABASE_URL`. If starting from a fresh clone, copy `.env.example` to `.env` first.
3. Set `DIRECT_URL` only if your database provider requires a separate direct connection for migrations.
4. Set `BETTER_AUTH_URL` to the application's exact origin (default `http://localhost:3000`). Use a random `BETTER_AUTH_SECRET` of at least 32 characters. This workspace already has a generated local secret; keep it private. New clones can generate one with `openssl rand -base64 32`.
5. Run `bun run db:deploy` to create the tables using the checked-in initial migration.
6. Run `bun dev`, open `/onboarding`, choose seeker or lister, and create an account.

No live database is provisioned by this repository. Migration SQL and client generation work before credentials are provided. `db:deploy` requires an accessible PostgreSQL database. Use an empty database for the initial migration; an existing database needs a migration baseline first.

For future schema changes, run `bun run db:migrate --name describe_change`, then `bun run db:generate`. Apply reviewed migrations to deployments with `bun run db:deploy`. Deployment builds generate the client but do not automatically migrate the database.

## Implemented flows

- **Accounts:** email/password signup, signin, database sessions, signout, and database-backed authentication rate limits through Better Auth. Passwords are hashed by the authentication library; sessions use HttpOnly cookies.
- **Onboarding:** choose seeker or lister, create an account, and save a profile. Seekers can store area, budget, and lease preferences. Listers choose landlord, agent, or property manager. An existing seeker can return to onboarding to enable listing access. Privileged roles cannot be self-assigned.
- **Drafts:** authenticated listers create, reload, update, and archive their own listings. Property basics are required before the first save. Editing uses `/listings/{id}/edit`; the old `/listings/new?edit={id}` URL redirects there.
- **Capture:** saving a room uploads its source photo to Cloudinary and persists the corrected boundary and four-corner calibration reference. The server recomputes floor area, rejects degenerate/crossed geometry, and retains measurement history tied to the source photo. Replacing a photo invalidates the current measurement. Coordinates are normalized to the full photo; the editor uses a fixed 4:3 display frame without cropping.
- **Review:** all rooms need a photo and measurement before submission. Submission sets `IN_REVIEW`. Editing is restricted to drafts and rejected listings. Manual measurements have no confidence score and never receive an AI or scout badge.
- **Discovery:** public APIs and screens return published listings only, with pagination and filters for area, price, floor area, lease term, and verification. Public responses exclude private addresses and account contact details. Favourites persist for authenticated users.
- **Dashboard:** current user's listing statuses, properties, recorded views, enquiries, and trust data. New trust scores remain unassessed.

The initial schema also includes moderation, fraud flags, processing jobs, verification scouts and requests, messages, conversations, and saved searches as foundations for subsequent work.

## Photo storage

Set `CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"` in `.env`. The upload route keeps signing credentials server-side. JPG, PNG, and WebP uploads are limited to 4 MB to fit the serverless request envelope. Account creation and draft saving work without Cloudinary; room-photo saving and submission require it.

No external photo uploads are performed by the automated tests. Tests insert an isolated photo record to exercise the measurement contract.

## API

Responses from application APIs use `{ "data": ... }` or `{ "error": { "message": "..." } }`. Better Auth uses its own response contract under `/api/auth`. Mutations require the same `Origin` as `BETTER_AUTH_URL`; use that header for direct API testing.

| Method | Route | Access / purpose |
| --- | --- | --- |
| POST | `/api/auth/sign-up/email` | Create an account; body: name, email, password |
| POST | `/api/auth/sign-in/email` | Sign in with email/password |
| POST | `/api/auth/sign-out` | Revoke session |
| GET | `/api/auth/get-session` | Session information |
| GET | `/api/me` | Current profile |
| POST | `/api/onboarding` | Save seeker/lister onboarding |
| GET | `/api/listings` | Published search: q, area, maxPrice, minSqm, leaseTerm, verified, sort, page, limit |
| POST | `/api/listings` | Create own draft |
| GET | `/api/listings/mine` | Own latest 100 listings |
| GET/PATCH/DELETE | `/api/listings/{id}` | Read/update/archive own listing |
| GET | `/api/listings/public/{slug}` | Published listing details |
| POST | `/api/listings/{id}/submit` | Submit complete draft for review |
| POST | `/api/listings/{id}/rooms/{roomId}/photo` | Multipart `photo` upload |
| PUT | `/api/listings/{id}/rooms/{roomId}/measurement` | Save photoId, boundary, reference, correctionCount |
| GET/PUT/DELETE | `/api/listings/{id}/saved` | Read/save/unsave favourite |
| GET | `/api/dashboard` | Current lister's dashboard |

`PATCH /api/listings/{id}` accepts the complete editable draft and room list. Existing room IDs must belong to the listing; omitting an existing room removes it. Clients cannot submit ownership, publication state, verification status, confidence, or a claimed calculated area.

## Checks

- `bun test`: request-validation and geometry tests plus an isolated in-memory PostgreSQL-compatible integration database using PGlite's socket server. Integration tests create their own accounts and data on localhost port 55439, apply the migration, and shut down afterward. They do not use `.env` database credentials. A local TCP listener must be permitted.
- `bun run typecheck`: route type generation and TypeScript checks.
- `bun run lint`: repository ESLint check.
- `bun run build`: production build. If the local environment blocks Turbopack's subprocess port, `bun run build --webpack` uses the alternative compiler.
- `bun run db:validate`: Prisma schema validation.

## Remaining integrations

Email verification and password-reset delivery, Claude Vision/SAM processing and webhooks, automated duplicate detection, moderation UI and publication actions, live messaging, scout workflows, Paystack, and a calculated trust-score formula are not implemented yet. Their database models do not imply those services are running. The public catalogue is empty until listings are approved and published through a future moderation flow or controlled database administration.

The account implementation follows [Better Auth's Next.js integration](https://better-auth.com/docs/integrations/next) and [Prisma adapter setup](https://better-auth.com/docs/adapters/prisma). Photo uploads follow [Cloudinary's authenticated upload API](https://cloudinary.com/documentation/upload_images).
