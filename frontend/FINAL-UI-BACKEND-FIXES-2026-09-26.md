# WORKFORCE Final UI + Backend Fixes — 2026-09-26

## Confirmed requirements
- Worker signup: camera-only selfie is mandatory and becomes the permanent profile photo.
- Aadhaar / ID is mandatory.
- Experience Certificate is optional.
- Skill Certificate and Other Document are not part of worker signup.
- Worker signup redirects to the pending verification screen after OTP verification.
- Worker UI remains locked until verification is approved.
- Admin, customer and worker interfaces use the supplied visual references: light background, WORKFORCE navy/green palette, responsive layouts.
- Hero copy is HTML/i18n text; hero images do not contain the language-dependent copy.
- No fake worker/customer/admin business metrics are used in the customer/worker data views; live API values are used where an endpoint exists.
- Change Password fields are closed and open only after clicking Change Password.
- WorkGuide uses OpenRouter first and OpenAI as fallback. If both keys are absent, the backend uses a database-aware fallback response rather than inventing workers/jobs.

## Critical backend fix
`VerificationDocument` is imported as the default Mongoose model before `insertMany()` is called. Each saved verification document now receives `worker`, `type`, `fileName`, `contentType`, `size`, `storageKey` and `status` explicitly. Experience is only created when the optional file is present.

## Private documents
Admin document access uses an authenticated backend endpoint. Documents are stored through the private storage service; no public document URL is exposed.

## Environment
Frontend: `VITE_API_URL=http://localhost:5000/api`
Backend AI: `OPENROUTER_API_KEY` + `OPENROUTER_MODEL` and `OPENAI_API_KEY` + `OPENAI_MODEL`.
Do not put MongoDB, JWT, R2, Redis or AI secrets into the frontend `.env`.

## Validation
- Backend: every JS file passes `node --check`.
- Frontend: all 75 TS/TSX files pass TypeScript parser syntax validation.
- A full Vite build could not be completed in this environment because `npm install` timed out and the frontend dependencies were not available locally. No claim of a completed production build is made.
