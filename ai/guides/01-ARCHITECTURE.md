---
description: E-commerce Marketplace - Full Stack AI Development Guide
version: 2.0
location: ai/guides/01-ARCHITECTURE.md
---

# 🎯 E-Commerce Marketplace: Architecture Guide

**Status**: Production Ready  
**Last Updated**: April 29, 2026  
**Full Reference**: See `ai/guides/` for other documentation

---

## Project Overview

Full-stack multi-tenant e-commerce marketplace with dual customer interfaces (buyer/seller), real-time job queues, payment integration, and advanced inventory management.

### Architecture at a Glance

```
FRONTEND LAYER                  BACKEND LAYER              SERVICES
├─ Client (Buyer)              ├─ Express API             ├─ MongoDB
└─ Seller Dashboard            ├─ Job Queues (BullMQ)     ├─ Redis
                               ├─ Auth & Middleware       ├─ Razorpay
                               └─ Service Layer           ├─ Cloudinary
                                                          └─ Resend (Email)
```

---

## 📁 Project Structure

### Backend (`/backend`)

```
src/
├─ config/          # Database, Redis, BullMQ, Cloudinary setup
├─ controllers/     # Request handlers (auth, orders, products, sellers)
├─ models/          # Mongoose schemas (User, Seller, Product, Order)
├─ services/        # Business logic (Order, Payment, Mail, Inventory)
├─ jobs/            # Job payload handlers (mail, inventory)
├─ workers/         # BullMQ worker processes
├─ queues/          # Queue definitions & routing
├─ routers/         # Route definitions & middleware chains
├─ middlewares/     # Auth, Seller status checks, File uploads
├─ utils/           # Helpers (Razorpay, Cloudinary, Validators)
├─ templates/       # Email templates
└─ validations/     # Request body schemas
```

### Frontend (`/client` & `/seller`)

```
src/
├─ components/      # Reusable UI components
├─ pages/           # Route-level components
├─ store/           # Redux slices & app store
├─ utils/           # API calls, constants, helpers
├─ layout/          # Protected routes, navbar, footer
└─ assets/          # Images, icons, static files
```

---

## 🛠️ Technology Stack

| Layer                | Technologies                  | Purpose                         |
| -------------------- | ----------------------------- | ------------------------------- |
| **Backend Runtime**  | Node.js 18+, Express 5        | API server                      |
| **Database**         | MongoDB (Mongoose 8.18)       | Primary data store              |
| **Caching/Queues**   | Redis, BullMQ 5.73, IORedis   | Job queues, rate limiting       |
| **File Management**  | Cloudinary SDK                | Image hosting & transformations |
| **Payments**         | Razorpay 2.9.6                | Payment processing & webhooks   |
| **Authentication**   | JWT (jsonwebtoken 9.0)        | Stateless auth                  |
| **Frontend Build**   | Vite, React 18+               | Optimized bundling              |
| **State Management** | Redux Toolkit + Redux Persist | Predictable state               |
| **Styling**          | Tailwind CSS                  | Utility-first CSS               |
| **HTTP Client**      | Axios                         | API requests with interceptors  |
| **Email**            | Resend SDK                    | Transactional emails            |

---

## 🚀 Development Commands

### Backend

```bash
npm run dev      # Start with nodemon (hot-reload)
npm start        # Production mode
npm test         # Run tests
```

### Frontend (Client & Seller)

```bash
npm run dev      # Vite dev server (localhost:5173 / 5174)
npm run build    # Production build
npm run preview  # Preview production build
```

---

## ⚙️ Environment Configuration

### Backend `.env`

```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://...
JWT_SECRET=your-super-secret-key
REDIS_URL=redis://localhost:6379

# Payment Gateway
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email Service
RESEND_API_KEY=your_key

# Image Hosting
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Frontend `.env`

```
VITE_BASE_URL=http://localhost:4000/api
VITE_API_TIMEOUT=10000
```

---

## 🔐 Authentication & Authorization

### JWT Implementation

- **Token Expiry**: 3 days
- **Storage**: HTTP-only cookies (secure flag in production)
- **Claims**: `{ id, role }` (role applies to sellers)
- **Verification**: `authMiddleware.js` on protected routes

### CORS Configuration

**Allowed Origins** (update when deploying):

```javascript
[
  "http://localhost:5173", // Client dev
  "http://localhost:5174", // Seller dev
  "https://trustkart-lemon.vercel.app", // Client prod
  "https://trustkart-seller.vercel.app", // Seller prod
];
```

**When adding new domains:**

1. Update `backend/src/server.js` CORS array
2. Ensure new origin is HTTPS in production
3. Test with curl

---

## 🎯 AI Development Agents

See `ai/agents/` for specialized documentation:

- **backend.agent.md** - API/Express patterns
- **frontend.agent.md** - React/component patterns
- **db.agent.md** - Database/query optimization
- **security.agent.md** - Auth/security patterns

---

## Implementation Focus

When extending the system, prioritize:

1. Security-sensitive flows first
2. Data integrity and transaction safety
3. Query efficiency and pagination
4. Clear API contracts and verification

---

## 📊 Performance Optimization

### Database

- [ ] Index email, phone in User & Seller
- [ ] Index product, seller, order.status fields
- [ ] Use `.lean()` for read queries
- [ ] Connection pooling (Mongoose: default 10)

### API

- [ ] Paginate all list endpoints
- [ ] Use `.select()` to exclude unused fields
- [ ] Enable response compression (gzip)
- [ ] Add HTTP caching headers

### Frontend

- [ ] Code split pages with React.lazy()
- [ ] Optimize images with Cloudinary
- [ ] Virtual scrolling for long lists
- [ ] Redux selector memoization

### Jobs

- [ ] Monitor queue size
- [ ] Set concurrency by CPU cores
- [ ] Circuit breaker for email
- [ ] Add observability (Sentry)

---

## 📈 API Endpoint Reference

### Authentication (`/api/auth`)

```
POST   /register           Register new user/seller
POST   /login              Authenticate & set token
POST   /logout             Clear token
GET    /verify             Check auth status
```

### Products (`/api/products`)

```
GET    /                   List products (paginated)
GET    /:id                Get details
POST   /                   Create (seller only)
PUT    /:id                Update
DELETE /:id                Delete
```

### Orders

```
POST   /orders             Create
GET    /orders             List user's orders
GET    /orders/:id         Get details
PUT    /orders/:id         Update status (seller)
```

### Payment (`/api/payment`)

```
POST   /create-order       Create Razorpay order
POST   /verify-payment     Verify & capture
POST   /webhook            Razorpay webhook
```

---

## ✅ Pre-Deployment Checklist

- [ ] All `.env` vars configured (no secrets in code)
- [ ] MongoDB indexes created
- [ ] Redis connection pooling verified
- [ ] Rate limiting enabled
- [ ] CORS origins updated
- [ ] Webhook URLs updated
- [ ] SSL certificates valid
- [ ] Monitoring alerts set up
- [ ] Database backups automated
- [ ] Security headers added (helmet)
- [ ] Load testing completed

---

## 🔗 Key Files for Quick Reference

- **Core Config**: `backend/src/server.js`, `backend/src/config/database.js`
- **Auth**: `backend/src/controllers/authController.js`, `backend/src/middlewares/authMiddleware.js`
- **Payment**: `backend/src/services/payment.service.js`, `backend/src/utils/razorpayWebhookVerifier.js`
- **Jobs**: `backend/src/workers/mail.worker.js`, `backend/src/workers/inventory.worker.js`
- **Redux**: `client/src/store/appStore.js`, `client/src/store/userSlice.js`

---

**Next**: Read `ai/guides/03-DEVELOPMENT_PLANNER.md` for planning workflow and `ai/skills/` for implementation patterns.
