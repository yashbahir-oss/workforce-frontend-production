# WORKFORCE frontend — requested fixes (2026-09-28)

Implemented only the requested Worker / Customer / Admin changes.

## Worker
- Mobile Quick Access is 3 cards per row.
- Fixed mobile bottom navigation so it does not horizontally scroll.
- Added compact main footer on mobile and enabled the main footer on desktop.
- Worker job cards use the customer-uploaded requirement image; a standard worker image is used only when no requirement image exists or the image fails.
- Worker hero title is constrained so the text is not hidden by the hero image.
- Added WorkGuide and Help & Support to the worker header.
- Removed duplicate profile navigation from the worker header; Profile appears once in the header.
- Worker booking cards show customer name/photo and expose customer chat for accepted/confirmed/active/completed bookings.
- Camera-only selfie remains mandatory for Start Work; no gallery/file fallback.
- Added Socket.IO client realtime message listener for customer/worker chat.
- Worker job like/save button has visible selected state.
- Worker footer links use worker routes.

## Customer
- Worker card favorite/like button is on the left side of the worker image and uses the backend favorite API.
- Added Worker Requests and Help & Support to the customer header.
- Added Worker Requests route and Support route.
- Customer mobile layout has a fixed, non-scrolling bottom navigation and compact footer.
- WorkGuide worker matching is backed by MongoDB category/skill vocabulary; category requests return matching verified workers from the database.
- Customer requirement image upload remains available when posting a requirement.
- Chat supports realtime messages and protected image/PDF attachments.

## Admin
- Sidebar active-state matching is exact, including query modules, so only one sidebar item can be selected.
- Removed the admin WorkGuide sidebar item; Government Schemes / AI Assistant are not present in the admin sidebar.
- Users page has separate Customer / Worker category filters.
- Added Role button.
- Customer -> Worker role change requires work experience, Aadhaar/ID upload and a camera-only selfie. The new worker starts as pending verification.
- Worker -> Customer role change is supported without the worker verification form.

## Security / data
- Role change and document handling are backend endpoints protected by admin RBAC.
- Aadhaar/ID is stored through the existing private storage service.
- The final backend ZIP excludes the local `.env` file; use `.env.example` and your own secrets.
