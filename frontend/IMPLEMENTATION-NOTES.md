# WORKFORCE production update

- Workforce admin no longer exposes Government Offices, Government Schemes or AI Sahayak as admin modules.
- Admin modules: Dashboard, Complaints, Users, Worker Verification, Jobs, Bookings, Analytics, Settings.
- Admin dashboard uses live MongoDB statistics and time-based greeting.
- Worker signup collects profession, skills, experience, district/taluka, city, area, languages, bio and verification documents.
- Worker signup creates a `pending` verification profile; admin can approve/reject it.
- Rejected workers can update/re-upload documents from Worker Profile.
- Worker jobs, applications, bookings, notifications, profile and WorkGuide use backend APIs; no seeded frontend worker data.
- Customer/worker role routing is preserved from the authenticated backend role.
- Worker/customer feedback uses Sonner toast notifications plus browser prompt/confirm where an explicit admin decision is required.
- New/changed UI in admin, worker, auth/signup and footer uses Tailwind utility classes rather than new custom CSS.

Validation performed:
- Backend: `npm run check` and all `src/**/*.js` syntax checks passed.
- Frontend: TypeScript/TSX parser validation passed. Full `npm run build` could not be run in the build environment because package installation timed out; run `npm i` then `npm run build` locally before deployment.
