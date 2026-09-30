# WORKFORCE Frontend – Code Guide

## Main rule
UI components should render data and handle UI events. Shared configuration/data belongs in dedicated modules. API calls belong in `src/lib/api.ts` or feature services.

## Important files

- `src/features/workforce/WorkforceLayout.tsx` – customer header, navigation, language menu, login/profile entry and page shell.
- `src/components/layout/WorkforceFooter.tsx` – reusable customer footer. Text comes from i18n and URLs/contact values come from `workforceConfig.ts`.
- `src/features/workforce/workforceConfig.ts` – reusable customer configuration such as support contacts, social URLs and trust statistics.
- `src/features/workforce/customerData.ts` – typed customer UI data/options. It is the development data adapter until the backend endpoint is connected.
- `src/features/workforce/workerData.ts` – typed worker data adapter used by customer-facing worker screens. Replace its source with API data later without rewriting the UI components.
- `src/features/workforce/BookingsPage.tsx` – booking page UI only. It filters shared booking data, renders cards and navigates to related pages; it does not define booking records inside JSX.
- `src/workforce.css` – reusable responsive customer styles. Booking layout uses `minmax(0, 1fr)` and explicit responsive breakpoints to prevent text/action overlap.
- `src/i18n/locales/*.json` – all customer-facing translations. Never add user-visible text directly to JSX when a translation key is appropriate.
- `src/lib/api.ts` – central API request/auth layer. Backend integration should be added here instead of calling `fetch()` directly from page components.

## Booking layout rule
The booking card has three layout responsibilities:
1. fixed worker image column;
2. flexible text column (`minmax(0, 1fr)`);
3. dedicated actions column.

At smaller widths, the actions move below the content. This prevents long names, dates, translations and buttons from overlapping.

## Backend integration
When the Node/Express backend is ready, replace the development data adapter with API/React Query data. Keep the page component API-independent so the UI does not need to be rewritten.


## Responsive polish added
- `src/components/forms/RoleSelector.tsx`: reusable customer/worker signup selector using real radio state.
- `src/features/workforce/CustomerHomePage.tsx`: category options are rendered from the shared category configuration.
- `src/features/workforce/WorkGuidePage.tsx`: responsive grid is class-driven, not an inline breakpoint-unaware style.
- `src/workforce.css`: final responsive rules cover hero, trust metrics, worker cards, Find Workers, WorkGuide, bookings, footer and header.

Business data remains API-owned for bookings. Worker cards currently consume the existing worker data module until the worker search endpoint is connected; no worker record is embedded inside the page JSX.
