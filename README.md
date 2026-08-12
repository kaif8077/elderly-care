# ElderlyCare

ElderlyCare is a MERN-stack healthcare-support platform designed to help senior citizens and their families organize essential medical information and access permitted emergency details through a secure QR-based ID card.

The project accompanies the research work **“QR-Based Emergency Alert and Medical Profile System for Senior Citizens.”** It demonstrates how structured medical profiles, revocable QR access, emergency contacts, geolocation alerts, and privacy-aware backend controls can support faster emergency assistance.

> ElderlyCare provides emergency-information and general wellness support. It is not a diagnostic system or a substitute for professional medical advice.

## Links

- **Live application:** [kaif8077-elderly-care.vercel.app](https://kaif8077-elderly-care.vercel.app/)
- **GitHub repository:** [github.com/kaif8077/elderly-care](https://github.com/kaif8077/elderly-care)

## Core features

- Email OTP registration and password recovery through Resend
- Secure email-and-password login using JWT and bcrypt
- Structured, multi-section medical profiles with draft saving
- Profile photograph and protected medical-document uploads
- Multiple emergency contacts and contact verification
- Unique 12-digit ElderlyCare ID
- QR-based emergency ID card with PDF download
- Random, revocable QR access tokens
- Privacy-controlled public emergency information
- Emergency alerts with browser-approved geolocation
- Saved health recommendations with PDF download and feedback
- Caregiver, guardian, doctor, notification, and reminder workflows
- Role-based admin authentication and authorization
- Admin dashboard, user management, contact messages, and audit logs
- Responsive user and admin interfaces built with Ant Design

## How it works

```text
Register and verify email
        ↓
Create and complete the medical profile
        ↓
Configure emergency contacts and privacy settings
        ↓
Generate the ElderlyCare ID card and secure QR code
        ↓
A responder scans the QR code during an emergency
        ↓
The backend returns only permitted emergency information
        ↓
The responder can contact family or share a location-based alert
```

The QR code does not contain the complete medical record or a predictable MongoDB ID. It contains an opaque token that can be revoked and regenerated.

## Technology stack

### Frontend

| Technology | Version | Purpose |
| --- | ---: | --- |
| React | 19.x | Component-based user interface |
| Vite | 7.3.6 | Development server and production build |
| React Router DOM | 6.30.4 | Public, protected, emergency, and admin routes |
| Ant Design | 5.29.3 | Forms, layouts, tables, modals, and responsive UI |
| Axios | 1.8.x | REST API communication |
| jsPDF | 4.2.1 | Client-side ID-card PDF generation |
| html2canvas | 1.4.1 | ID-card rendering for PDF output |
| React Toastify | 11.x | Success and error notifications |
| Vitest | 3.2.7 | Frontend testing |

### Backend

| Technology | Version | Purpose |
| --- | ---: | --- |
| Node.js | 20.19+ | Backend runtime |
| Express | 4.21.2 | REST APIs and middleware |
| MongoDB | 6+ recommended | Application data and GridFS file storage |
| Mongoose | 8.12.x | Schemas, validation, indexes, and queries |
| bcrypt | 6.x | Password hashing |
| JSON Web Token | 9.0.2 | User and admin sessions |
| Resend | 6.17.1 | OTP, contact, verification, and alert emails |
| Multer | 2.2.x | Multipart file uploads |
| QRCode | 1.5.4 | Secure QR image generation |
| PDFKit | 0.17.2 | Server-side PDF generation |

## Project structure

```text
elderly-care/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, RBAC, uploads, and rate limits
│   ├── models/          # Mongoose schemas
│   ├── routes/          # REST API modules
│   ├── scripts/         # Admin seed script
│   ├── services/        # Email, reports, storage, alerts, and business logic
│   ├── tests/           # Backend tests
│   ├── app.js           # Express application
│   └── server.js        # Backend entry point
├── frontend/
│   ├── public/          # Public static files
│   ├── src/
│   │   ├── admin/       # Admin layout, pages, API client, and auth context
│   │   ├── assests/     # Project images
│   │   ├── components/  # Shared components
│   │   ├── context/     # User authentication state
│   │   ├── pages/       # Public, user, and emergency pages
│   │   ├── services/    # Frontend API services
│   │   └── theme/       # Shared Ant Design styling
│   ├── vite.config.js
│   └── package.json
├── package.json
└── README.md
```

## Installation

### Prerequisites

Install or prepare:

- Node.js `20.19.0` or newer
- npm
- Git
- MongoDB 6+ locally, or a MongoDB Atlas connection string
- A Resend account for email OTPs and notifications

### 1. Clone the repository

```bash
git clone https://github.com/kaif8077/elderly-care.git
cd elderly-care
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create the backend environment file

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Update `backend/.env` with your own configuration:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/elderly-care

JWT_SECRET=replace_with_a_long_random_user_secret
ADMIN_JWT_SECRET=replace_with_a_different_long_random_admin_secret
ALERT_HASH_SECRET=replace_with_a_third_long_random_secret

ADMIN_SESSION_HOURS=8
ADMIN_COOKIE_SAME_SITE=lax
ADMIN_EMAIL=elderlycare@gmail.com
ADMIN_PASSWORD=replace_with_a_strong_development_password
ADMIN_FORCE_PASSWORD_CHANGE=true

FRONTEND_URL=http://localhost:5173
RENDER_BACKEND_URL=http://localhost:5000

RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
SYSTEM_NOTIFICATION_EMAIL=your_email@example.com

ENABLE_EXTERNAL_AI=false
```

Generate separate random secrets instead of reusing passwords:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `.env` files or expose database credentials, JWT secrets, email-provider keys, admin passwords, or medical information in frontend environment variables.

### 4. Configure MongoDB

For local MongoDB, start the MongoDB service and use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/elderly-care
```

For MongoDB Atlas, create a database user, allow your current IP address, and set `MONGO_URI` to the Atlas connection string.

### 5. Configure Resend

1. Create a Resend account.
2. Generate an API key.
3. Set `RESEND_API_KEY` in `backend/.env`.
4. Use `onboarding@resend.dev` for supported testing scenarios.
5. Verify your own sending domain before using a custom production sender.

### 6. Create the admin account

From the `backend` directory, run:

```bash
npm run seed:admin
```

The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`, hashes the password, avoids duplicate admins, and creates the account with the `admin` role.

### 7. Start the backend

Development mode with automatic restart:

```bash
npm run server
```

Or start with Node:

```bash
npm start
```

The backend is available at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 8. Install frontend dependencies

Open another terminal from the repository root:

```bash
cd frontend
npm install
```

### 9. Create the frontend environment file

Create `frontend/.env`:

```env
VITE_BACKEND_URI=http://localhost:5000
```

Do not place API keys or other secrets in variables beginning with `VITE_`; these values are included in the browser build.

### 10. Start the frontend

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

Admin login:

```text
http://localhost:5173/admin/login
```

## Available commands

### Repository root

```bash
npm test                  # Run backend tests
npm run build             # Build the frontend
npm run audit:production  # Audit backend production dependencies
```

### Backend

```bash
npm run server      # Start with Nodemon
npm start           # Start with Node
npm test            # Run backend tests
npm run seed:admin  # Create the configured admin account
```

### Frontend

```bash
npm run dev      # Start Vite development server
npm test         # Run frontend tests
npm run build    # Create production build
npm run preview  # Preview production build
```

## Verification

Run the available checks from the repository root:

```bash
npm test
npm --prefix frontend test
npm run build
```

The test suites cover authentication, role boundaries, admin sessions, medical-profile validation, QR privacy, document validation, emergency alerts, recommendations, reports, and application routes.

## Security notes

- Passwords are hashed with bcrypt.
- User APIs validate JWTs, account status, ownership, and session version.
- Admin APIs use HTTP-only cookies, role checks, permissions, lockout protection, and audit logs.
- QR codes contain revocable opaque tokens rather than complete medical records.
- Public emergency responses are filtered by backend privacy rules.
- Profile photographs and medical documents use authenticated GridFS access.
- Public alert and contact endpoints are rate-limited.
- The project does not claim healthcare-regulatory compliance without an independent professional audit.

## Research paper

**Title:** QR-Based Emergency Alert and Medical Profile System for Senior Citizens

The research explores QR-based emergency access, structured medical profiles, emergency alerts, geolocation, authentication, privacy controls, and secure information disclosure for senior citizens.

## Maintainer

Developed and maintained by [Mohammad Kaif](https://github.com/kaif8077).
