# EventO Platform Setup Guide

This guide provides instructions on how to set up and run the EventO backend application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running on your machine.
- [Git](https://git-scm.com/) (optional, for cloning the repository).
- Stripe Account (for payment processing).
- Cloudinary Account (for image hosting).

---

## 1. Environment Setup

Before starting the application, you must configure your environment variables. 

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file (if you haven't already) based on the `.env.example` structure.
3. Ensure the following critical variables are present:

   ```env
   PORT=5000
   NODE_ENV=development
   
   # JWT & Cookie Secrets
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   COOKIE_SECRET=your_cookie_secret
   
   # Cloudinary (Image Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Stripe (Payments)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
   *(Note: For local Docker usage, you **do not** need to change the `MONGO_URI` in your `.env`. The `docker-compose.yml` automatically overrides it to point to the local Docker database).*

---

## 2. Running with Docker (Recommended)

Running with Docker spins up the Node.js API, a local MongoDB database, and a Stripe CLI instance for webhooks.

1. Open your terminal.
2. **Navigate into the backend directory** (this is where the `docker-compose.yml` lives):
   ```bash
   cd backend
   ```
3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

**What happens now?**
- **Node API:** Available at `http://localhost:5000`
- **MongoDB:** Running locally on port `27017`
- **Stripe Webhooks:** Forwarded automatically to your local API.

To stop the servers gracefully, press `Ctrl+C` in the terminal, or run:
```bash
docker-compose down
```

---

## 3. Running Locally (Without Docker)

If you prefer to run the app natively using your system's Node.js and an external MongoDB Atlas cluster:

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Ensure your `.env` contains your Atlas connection string:
   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@cluster...
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Troubleshooting

- **`no configuration file provided: not found`**: You tried to run `docker-compose` from the root directory. Make sure you run `cd backend` first!
- **`querySrv ECONNREFUSED` (Without Docker)**: Your internet provider or VPN is blocking MongoDB Atlas DNS queries. Switching to Docker (Step 2) bypasses this completely by using a local database.
- **Port 5000 in use**: Ensure no other application (like an old node process) is running on port 5000.
