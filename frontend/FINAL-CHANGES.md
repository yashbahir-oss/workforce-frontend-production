# WORKFORCE final changes

## Worker signup
- Worker selfie is mandatory and is captured through the browser camera only.
- Gallery/file-picker fallback is intentionally not provided for the worker selfie.
- Aadhaar / ID is mandatory.
- Experience certificate is optional.
- Skill certificate and Other document are not part of worker signup.
- The signup selfie becomes the worker profile photo and cannot be replaced from the Worker profile.
- After OTP verification, an unverified worker is taken directly to the verification-pending screen. Worker navigation/dashboard remains locked until Admin approval.

## Authentication
- `/` and all customer/worker/admin protected routes require an authenticated session.
- Direct protected URL access redirects to `/login` when unauthenticated.
- Added a global React Error Boundary fallback.

## Admin verification
- Verification page now has Pending / Approved / Rejected filters.
- Worker selfie/profile photo is shown to Admin.
- Submitted verification documents are listed per worker.
- Document open/preview uses the authenticated backend document endpoint.

## Important
- Do not copy a real `.env` into source control. Create `.env` locally from `.env.example`.
- Frontend local API default is `http://localhost:5000/api`.
