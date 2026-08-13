# ElderlyCare

ElderlyCare is a MERN-stack healthcare-support platform for managing senior citizens' essential medical information and providing privacy-controlled emergency access through a secure QR-based ID card.

Users can create structured medical profiles, add emergency contacts, upload protected documents, generate health recommendations, and share permitted emergency details. A separate role-protected admin panel supports user management, ID-card access, contact messages, and audit logs.

> ElderlyCare provides emergency-information and general wellness support. It is not a diagnostic system or a replacement for professional medical advice.

## Features

- Email OTP registration and password recovery with Resend
- Secure email/password login using JWT and bcrypt
- Multi-section medical profiles with draft saving
- Profile photographs and protected medical documents
- Multiple emergency contacts and contact verification
- Unique 12-digit ElderlyCare ID
- QR-based emergency ID card and PDF download
- Random, revocable QR access tokens
- Privacy-filtered public emergency information
- Emergency alerts with browser-approved geolocation
- Saved health recommendations and PDF downloads
- Caregiver, guardian, doctor, and reminder workflows
- Role-based admin dashboard and audit logs
- Responsive React and Ant Design interface

## Workflow

```text
Register and verify email
        ->
Complete the medical profile
        ->
Add emergency contacts and privacy settings
        ->
Generate the ElderlyCare ID card and QR code
        ->
A responder scans the QR during an emergency
        ->
The backend displays only permitted information
        ->
The responder contacts family or shares an alert
```

The QR code contains an opaque, revocable token instead of the complete medical record or a predictable database ID.

## Technology stack

### Frontend

- React 19
- Vite 7
- React Router 6
- Ant Design 5
- Axios
- jsPDF and html2canvas
- React Toastify
- Vitest and Testing Library

### Backend

- Node.js 20+
- Express 4
- MongoDB and Mongoose 8
- JWT and bcrypt
- Resend
- Multer and MongoDB GridFS
- QRCode
- PDFKit

## Project structure

```text
elderly-care/
|-- backend/
|   |-- config/       # Database connection
|   |-- controllers/  # Request handlers
|   |-- middleware/   # Authentication, RBAC, uploads, rate limits
|   |-- models/       # Mongoose schemas
|   |-- routes/       # REST API routes
|   |-- scripts/      # Admin seed script
|   |-- services/     # Business and provider services
|   `-- tests/        # Backend tests
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- admin/       # Admin module
|       |-- components/  # Shared components
|       |-- context/     # User authentication
|       |-- pages/       # Application pages
|       |-- services/    # API helpers
|       `-- theme/       # Shared styling
|-- package.json
`-- README.md
```

## Local installation

### Prerequisites

- Node.js 20.19 or newer
- npm and Git
- Local MongoDB or MongoDB Atlas
- Resend account for emails

### 1. Clone and install

```bash
git clone https://github.com/kaif8077/elderly-care.git
cd elderly-care

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and provide your own values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/elderly-care

JWT_SECRET=replace_with_a_long_random_secret
ADMIN_JWT_SECRET=replace_with_a_different_random_secret
ALERT_HASH_SECRET=replace_with_another_random_secret

ADMIN_SESSION_HOURS=8
ADMIN_COOKIE_SAME_SITE=lax
ADMIN_EMAIL=elderlycare@gmail.com
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_FORCE_PASSWORD_CHANGE=true

FRONTEND_URL=http://localhost:5173
RENDER_BACKEND_URL=http://localhost:5000

RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
SYSTEM_NOTIFICATION_EMAIL=your_email@example.com

ENABLE_EXTERNAL_AI=false
```

Generate independent secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the admin account

```bash
cd backend
npm run seed:admin
```

The seed script hashes the configured password and avoids duplicate admin accounts.

### 4. Configure the frontend

Create `frontend/.env`:

```env
VITE_BACKEND_URI=http://localhost:5000
```

Never place secrets in `VITE_` variables because they are included in the browser build.

### 5. Run the application

Start the backend:

```bash
cd backend
npm run server
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The backend runs on `http://localhost:5000`.

## Testing

From the repository root:

```bash
npm test
npm --prefix frontend test
npm run build
```

## Security notes

- Passwords are hashed with bcrypt.
- Protected APIs verify authentication, account status, ownership, and permissions.
- Admin sessions use HTTP-only cookies and backend role checks.
- Public QR responses are filtered by backend privacy rules.
- Uploaded photographs and documents require authenticated access.
- Public contact and emergency-alert endpoints are rate-limited.
- Never commit `.env` files, credentials, API keys, or real medical information.

## Maintainer

Developed and maintained by [Mohammad Kaif](https://github.com/kaif8077).
