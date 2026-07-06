# Full-Stack Email Job Scheduler

A complete full-stack application for scheduling, throttling, and delivering emails using a background queue. Built for scale and reliability, ensuring no emails are lost during server restarts and rate limits are strictly respected.

## 🚀 Tech Stack

**Frontend:**
- React 19 (Vite)
- TypeScript
- Tailwind CSS
- React Simple WYSIWYG (Rich Text Editor)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- TypeScript
- BullMQ & Redis (Job Queue & Scheduling)
- Prisma & PostgreSQL (Database & Persistence)
- Nodemailer (Email Delivery)

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or via Docker)
- Redis (running locally or via Docker)

### 1. Backend Setup
Navigate to the `backend-assignment` directory:
```bash
cd backend-assignment
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Port
PORT=4000

# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/email_scheduler?schema=public"

# Redis Connection URL
REDIS_URL="redis://localhost:6379"

# SMTP Credentials (Leave empty to auto-generate an Ethereal Test Account!)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

Run database migrations to initialize tables:
```bash
npx prisma generate
npx prisma db push
```

Start the backend server & BullMQ worker:
```bash
npm run dev
```

> **Note on Ethereal Email:** If you leave `SMTP_USER` and `SMTP_PASS` blank in your `.env`, the backend will automatically generate a temporary Ethereal test account on boot and print the credentials in the console! All emails will be safely captured by Ethereal and a preview URL will be logged.

### 2. Frontend Setup
Navigate to the `frontend-assignment` directory in a new terminal:
```bash
cd frontend-assignment
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:4000/api
```

Start the Vite development server:
```bash
npm run dev
```

---

## 🏗️ Architecture Overview

### 1. How Scheduling Works
Scheduling is managed entirely by **BullMQ**. When an email is scheduled, the backend calculates the delay in milliseconds and pushes a job to Redis using BullMQ's `delay` option. BullMQ handles keeping the job dormant until the precise timestamp is reached, at which point it's moved to the active queue for the worker to process.

### 2. Persistence on Restart
Because the application uses a dual-layer architecture (PostgreSQL + Redis), it is highly resilient:
- **Database (PostgreSQL):** Every scheduled email is permanently saved to PostgreSQL with a status of `PENDING`. 
- **Queue (Redis):** BullMQ stores the exact execution state. If the Node.js server crashes, Redis remembers all delayed jobs. Upon restart, the BullMQ worker automatically resumes processing exactly where it left off. No scheduled jobs are lost.

### 3. Rate Limiting & Concurrency
- **Rate Limiting:** Implemented dynamically using Redis keys (`rate_limit:{sender_email}`). Before processing a job, the worker checks if sending the email would exceed the user-defined `hourlyLimit`. If the limit is reached, BullMQ's `moveToDelayed` is triggered, pausing the specific job and throwing a `DelayedError` to automatically retry it when the hour rolls over.
- **Concurrency:** The BullMQ worker is configured to process multiple jobs simultaneously. This can be tuned via `config.workerConcurrency` to scale throughput based on server capacity.

---

## ✨ Features Implemented

### Backend
- [x] **Express API:** RESTful endpoints for scheduling, fetching history, and deleting campaigns.
- [x] **BullMQ Scheduler:** Precise delayed execution using Redis.
- [x] **Persistence:** PostgreSQL database via Prisma for zero data loss on restarts.
- [x] **Rate Limiting:** Redis-backed hourly throttling with automatic job requeuing.
- [x] **Concurrency:** Configurable worker concurrency for parallel email processing.
- [x] **Idempotency:** Safety checks ensure the same recipient isn't emailed twice for the same campaign.

### Frontend
- [x] **Mock Google Auth:** Visual login screen matching Figma designs.
- [x] **Dashboard:** Interactive tabs for "Scheduled" and "Sent" emails with color-coded status badges.
- [x] **Compose Page:** Dynamic form for subject, delay, rate limits, and scheduling times.
- [x] **Bulk CSV Upload:** Ability to quickly extract recipient emails from a `.csv` or `.txt` file.
- [x] **Rich Text Editor:** Full WYSIWYG editor (`react-simple-wysiwyg`) allowing bold, italic, links, and lists that translate directly to HTML emails.

---

## 🧠 Assumptions, Shortcuts & Trade-offs

1. **Authentication Mocking:** Since the core assignment focuses on scheduling and queuing, the Google OAuth flow is visually mocked in the UI and uses a generic JWT/mock-user on the backend. True OAuth 2.0 integration was skipped to focus on the queuing architecture.
2. **Ethereal Defaults:** Rather than forcing reviewers to input real SMTP credentials, the backend generates an ephemeral Ethereal account on boot by default.
3. **Timezones:** The frontend sends the scheduled time as a strict ISO string, relying on the user's local timezone.
4. **Rich Text vs HTML:** While the backend uses Nodemailer's `html` property, we allow plain text fallback. The WYSIWYG editor natively injects HTML tags, meaning the email format relies strictly on standard HTML parsing.