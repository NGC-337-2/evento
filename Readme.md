# 🎟️ EventO — Online Event Booking & Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.12-339933?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-6772E5?logo=stripe)](https://stripe.com/)

**EventO** is a full-stack, production-ready event booking and management platform. It enables attendees to discover and book events, organizers to create and manage listings, and administrators to monitor platform activity. Built with a modern, scalable architecture and deployed via Vercel & Railway.

---

## ✨ Core Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | Secure JWT-based auth with `bcrypt` password hashing, refresh tokens, and role-based access (User / Organizer / Admin) |
| 🎪 **Event Management** | Full CRUD, draft/publish workflow, capacity tracking, Cloudinary image uploads, and category tagging |
| 🔍 **Discovery & Search** | Advanced filtering, keyword search, date/price/location ranges, debounced queries, and RTK Query caching |
| 🎫 **Booking & Ticketing** | Cart management, atomic capacity locking, QR code generation, and idempotent booking creation |
| 💳 **Payments** | Stripe PaymentIntents, secure webhook handling, idempotency keys, and automated receipt generation |
| 📧 **Email Notifications** | Automated booking confirmations, event updates, and organizer alerts via Nodemailer / SendGrid |
| 📊 **Dashboards & Analytics** | Role-specific UIs with revenue tracking, attendance metrics, and interactive charts via Recharts |
| 🧪 **Testing & CI/CD** | Unit/Integration tests (Vitest), E2E flows (Cypress), GitHub Actions pipeline, linting & formatting |

---

## 🛠 Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router v6, Recharts |
| **Backend** | Node.js, Express, Mongoose, JWT, bcrypt, Express-Validator / Zod |
| **Database** | MongoDB Atlas (Mongoose ODM, indexes, retry logic) |
| **Payments** | Stripe API (PaymentIntents, Webhooks, Test Mode) |
| **Media** | Cloudinary v2 SDK + Multer (buffer streaming) |
| **Email** | Nodemailer / SendGrid |
| **Testing** | Vitest (unit/integration), Cypress (E2E), Supertest |
| **DevOps** | GitHub Actions, ESLint + Prettier, Husky + lint-staged |
| **Deployment** | Vercel (Frontend), Railway (Backend & Database) |

---

## 📁 Project Structure

```
evento/
├── frontend/                 # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level views
│   │   ├── store/            # Redux Toolkit slices & RTK Query
│   │   ├── utils/            # Helpers, formatters, API clients
│   │   └── App.jsx
│   └── package.json
├── backend/                  # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/           # DB, logger, constants, cloudinary
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   └── utils/            # Helpers, upload, email, stripe
│   └── package.json
├── docs/                     # Architecture, API specs, runbooks
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18.12` & npm `>= 9`
- MongoDB Atlas account (or local MongoDB `>= 6.0`)
- Stripe Developer account
- Cloudinary account
- SendGrid account (or SMTP provider)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/evento.git
cd evento
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env  # Fill in your credentials
npm install
npm run dev           # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev           # Starts Vite on http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/evento?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
COOKIE_SECRET=your_cookie_secret
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_key
EMAIL_FROM=noreply@evento.app
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🧪 Testing

```bash
# Backend unit & integration tests
cd backend
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report

# Frontend & E2E tests
cd ../frontend
npm run test:e2e        # Cypress headless
npm run test:e2e:open   # Cypress UI
```

---

## 🌐 Deployment

| Service | Platform | Steps |
|---------|----------|-------|
| **Frontend** | Vercel | Connect repo → Set `VITE_API_URL` → Auto-deploy on `main` |
| **Backend** | Railway | Connect repo → Add env vars → Auto-deploy on `main` |
| **Database** | MongoDB Atlas | Whitelist Railway IPs → Create `evento` database |

🔍 **Health Check:** `GET /api/health` returns service status, DB state, and uptime.

---

## 📅 Development Roadmap

EventO follows a **14-week, 5-phase** implementation plan:
1. **Phase 1 (W1-3):** Project setup, auth, routing, CI/CD
2. **Phase 2 (W4-6):** Event CRUD, discovery, search, validation
3. **Phase 3 (W7-9):** Booking engine, Stripe payments, QR tickets, emails
4. **Phase 4 (W10-12):** User/Organizer/Admin dashboards, analytics, Recharts
5. **Phase 5 (W13-14):** Security hardening, E2E testing, docs, production launch

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request



## 📄 License

This project is licensed under the [MIT License](LICENSE).

---



> Built with ❤️ by the EventO  | Last Updated: `{{CURRENT_DATE}}`