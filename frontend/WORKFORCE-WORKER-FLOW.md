# WORKFORCE Worker Flow – Frontend Implementation

This build keeps the existing React + TypeScript + Vite + Tailwind project structure and adds the Worker-side product flow agreed in the conversation.

## Implemented in this frontend build
- Customer / Worker signup choice; Admin remains non-public.
- Role-aware redirects for customer, worker and admin.
- Worker verification gate: only `role=worker` + `verificationStatus=verified` opens the full Worker UI.
- Pending/rejected verification screen with re-upload entry.
- Worker navigation: Home, Find Work, My Applications, Bookings, Messages, WorkGuide, Notifications, Profile.
- No fixed Worker rate field; amount is discussed with the customer.
- Find Work filters: search, skills, location, date/duration, sorting.
- Relevant-job presentation and Busy/Unavailable application restrictions.
- Save/bookmark jobs.
- Application flow with Worker Profile, Skills, Experience, Availability and Message/Note.
- Application withdrawal.
- Booking details and work lifecycle UI.
- Arrival selfie required before Start Work.
- UI hook for profile/selfie match and location verification.
- Active-work → Mark Completed → Customer confirmation flow.
- Availability: Available / Busy / Unavailable.
- Notifications and unread badge.
- Verification document upload/re-upload UI.
- Separate Worker footer.
- Responsive desktop/tablet/mobile Worker UI.

## Backend integration still required
The supplied frontend project did not contain Worker-specific production REST/Socket.IO endpoints for all of the agreed flows. The UI therefore uses a small Zustand worker state for the first frontend build. Production persistence must be connected to the backend for:

- Worker role approval and verification status.
- Worker documents and Cloudflare R2 uploads.
- Jobs/requirements and relevance filtering.
- Applications and customer accept/reject.
- Bookings, cancellation and completion confirmation.
- Socket.IO messages and realtime notifications.
- Selfie storage and real face-match verification.
- GPS/location-radius verification and anti-spoofing.
- Work photos, complaints, reports, ratings/reviews.
- Admin Worker Management and audit history.

The frontend deliberately does not claim browser-side selfie similarity is a real biometric face match. The Start Work flow has the required UI gate and integration point; the authoritative face-match and GPS decision belongs on the backend.
