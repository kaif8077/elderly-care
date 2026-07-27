# ElderlyCare

ElderlyCare is a MERN application for private medical profiles, revocable emergency QR cards, emergency-summary reports, Resend OTP/email notifications, geolocation sharing, and role-protected administration.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or MongoDB Atlas
- A Resend account and verified sender for production email

## Backend setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed:admin
npm start
```

Required backend environment variables:

```env
MONGO_URI=mongodb_connection_string
JWT_SECRET=long_random_user_secret
ADMIN_JWT_SECRET=different_long_random_admin_secret
FRONTEND_URL=http://localhost:3000
RENDER_BACKEND_URL=http://localhost:5000
RESEND_API_KEY=resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
SYSTEM_NOTIFICATION_EMAIL=notification_recipient@example.com
ADMIN_EMAIL=elderlycare@gmail.com
ADMIN_PASSWORD=replace_before_production
```

`ADMIN_PASSWORD` is used only by `npm run seed:admin`. Change the development password before production. Never commit `.env`.

## Frontend setup

Create `frontend/.env`:

```env
VITE_BACKEND_URI=http://localhost:5000
```

Then run:

```powershell
cd frontend
npm install
npm run dev
```

## Verification

From the repository root:

```powershell
npm test
npm run build
npm run audit:production
```

The backend test command runs every file under `backend/tests`. The frontend production build includes lint checks.

## Deployment

For Render, use `npm install` as the backend build command and `npm start` as the start command. Configure the exact deployed frontend origin in `FRONTEND_URL` without a path. Multiple trusted origins may be comma-separated.

Health check endpoint:

```text
GET /api/health
```

It returns HTTP 200 only when MongoDB is connected; otherwise it returns HTTP 503 with a limited degraded status.

For a separate static frontend deployment, set `VITE_BACKEND_URI` during its build. Cross-origin admin sessions require HTTPS; the backend automatically uses secure, cross-site, partitioned admin cookies when frontend and backend origins differ.

## Privacy and security notes

- QR codes contain random revocable bearer tokens, not MongoDB IDs or medical records.
- Public QR responses use an explicit emergency-field allowlist.
- Profile photographs are stored in MongoDB GridFS and require authenticated access.
- Historical reports store immutable snapshots and authenticated PDFs.
- Disabled, archived, or deleted accounts cannot use protected APIs.
- The project does not claim legal or healthcare-regulatory compliance without an independent professional audit.
