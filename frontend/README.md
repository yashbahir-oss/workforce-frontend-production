# WORKFORCE Frontend

React + TypeScript + Vite + Tailwind CSS frontend for WORKFORCE.

## Local development

1. Start the WORKFORCE backend from `workforce_backend_work`.
2. The backend project in this package is configured for port `5000`.
3. Run:

```bash
npm install
npm run dev
```

The frontend `.env` points to:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployment, set `VITE_API_URL` to the deployed backend API URL before building.

## Data policy

Customer-facing worker, category, location, booking/chat and requirement data is loaded from the backend API. The old sample worker/conversation data files are not used.

## Styling

New customer footer and chat layout use Tailwind utility classes. The existing project structure and technology stack are preserved.
