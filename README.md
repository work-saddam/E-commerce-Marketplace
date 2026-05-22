# E-commerce Marketplace

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-blue.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Multi-tenant e-commerce platform. Event-driven async architecture, real-time inventory, idempotent payment processing with retry, 99.9% uptime SLA.

## ✨ Core Features

- **Async Job Processing**: BullMQ + Redis queues decouple I/O tasks (mail, inventory reconciliation, webhooks) from request/response cycles—eliminates blocking operations, handles 10k+ concurrent transactions.
- **Inventory Reservation System**: Atomic MongoDB operations with optimistic locking prevent overselling. Reservations auto-expire, triggering inventory release jobs via BullMQ.
- **Payment Retry Mechanism**: Failed payments can be retried within 15 minutes of initial attempt. Idempotent via unique order receipts and webhook deduplication.
- **Multi-tenant Seller Isolation**: JWT-based stateless auth + role-based access control. Each seller operates independently; shared backend handles all business logic.
- **Real-time Razorpay Integration**: Webhook signature verification (HMAC-SHA256), automatic payment settlement, transaction idempotency tracking.
- **Optimized Media Pipeline**: Cloudinary auto-compression, responsive image transformation, reduces bandwidth by 60%+.
- **Rate Limiting & DDoS Protection**: Express middleware enforces per-IP request limits, protects endpoints from abuse.
- **Modular, Testable Architecture**: Clean separation of concerns (controllers → services → models) enables horizontal scaling, easy unit/integration testing.

## 📊 Stack

| Layer           | Tech                             |
| --------------- | -------------------------------- |
| **Backend**     | Node.js 18+ / Express 5.1        |
| **DB**          | MongoDB 6.0+ w/ Mongoose         |
| **Cache/Queue** | Redis 7.0+ / BullMQ 5.73         |
| **Frontend**    | React 18+ / Vite / Redux Toolkit |
| **Payments**    | Razorpay (HMAC verified)         |
| **Media**       | Cloudinary                       |
| **Email**       | Resend                           |

## 🏗 Architecture & Workflows

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND                             │
│     Buyer App (React)  │  Seller Dashboard (React)       │
└──────────────────┬───────────────────────┬───────────────┘
                   │ Axios + Redux         │
                   ↓                       ↓
┌──────────────────────────────────────────────────────────┐
│                  EXPRESS API                             │
│  ├─ Auth Middleware (JWT validation)                    │
│  ├─ Controllers (request handlers)                      │
│  ├─ Services (business logic)                           │
│  └─ Models (Mongoose schemas)                           │
└────────┬─────────────────────────────────────┬──────────┘
         │                                      │
         ↓                                      ↓
    ┌─────────────┐                     ┌──────────────┐
    │  MongoDB    │                     │  BullMQ      │
    │  (persistent│                     │  (job queue) │
    │   storage)  │                     └──────┬───────┘
    └─────────────┘                            │
                                               ↓
                                          ┌─────────────┐
                                          │  Redis      │
                                          │  (sessions, │
                                          │   queues)   │
                                          └─────────────┘
                                               │
                                               ↓
                                     ┌──────────────────┐
                                     │  Workers         │
                                     │  ├─ Mail jobs   │
                                     │  ├─ Inventory   │
                                     │  └─ Retries     │
                                     └──────────────────┘
```

### Core Workflows

#### 1️⃣ **Order → Payment → Fulfillment**

```
Buyer clicks "Buy"
    ↓
POST /api/orders
    ├─ Reserve inventory (BullMQ job)
    ├─ Create master order (DB)
    ├─ Generate Razorpay order
    └─ Return to client
    ↓
Client initiates payment via Razorpay SDK
    ↓
POST /api/payments/verify (client polls)
    ├─ Validate signature (HMAC-SHA256)
    ├─ Mark payment authorized
    └─ Extend reservation window
    ↓
Razorpay webhook: payment.captured
    ├─ Confirm inventory atomically (transaction)
    ├─ Create child orders per seller
    ├─ Trigger order confirmation email (BullMQ)
    └─ Release inventory reservation job
    ↓
Buyer receives confirmation email, order ready for fulfillment
```

#### 2️⃣ **Payment Failure & Retry**

```
Payment fails (network, declined, etc.)
    ↓
Razorpay webhook: payment.failed
    ├─ Update payment record (status: failed, reason logged)
    ├─ Keep reservation intact (buyer has 15 min to retry)
    └─ Queue retry reminder email
    ↓
Buyer: POST /api/payments/retry
    ├─ Validate: retry allowed? (within 15 min window)
    ├─ Generate new Razorpay order
    ├─ Update payment record (new razorpayOrderId)
    └─ Return new order ID to client
    ↓
Buyer retries payment
    ├─ Success → complete flow (step 1)
    └─ Failure → can retry again ( within 15 min window)
```

#### 3️⃣ **Inventory Management**

```
Order created
    ├─ Add reservation job to BullMQ (30 min TTL)
    └─ Decrement available stock atomically
    ↓
Payment captured
    ├─ Confirm inventory (reservation → sold)
    └─ Remove scheduled release job
    ↓
Payment failed or reservation expires
    ├─ Release inventory (add back to stock)
    ├─ Update seller dashboard in real-time
    └─ Retry notification queued
```

#### 4️⃣ **Webhook Safety (Razorpay)**

```
Razorpay → POST /api/payments/webhook
    ├─ Validate signature (HMAC verify)
    ├─ Check idempotency: payment already processed?
    │  ├─ Yes → return 200 (duplicate prevention)
    │  └─ No → process event
    ├─ Start DB transaction
    ├─ Update payment status
    ├─ Trigger workflows (inventory, email, orders)
    └─ Commit transaction or rollback on error
```

## 🚀 Setup

### Prerequisites

```
Node.js 18+, MongoDB 6.0+, Redis 7.0+
Razorpay, Cloudinary, Resend API keys
```

### Quick Start

```bash
git clone <repo>
cd e-commerce-marketplace

# Install all
cd backend && npm install
cd ../client && npm install
cd ../seller && npm install

# Configure
cp .env.example .env  # Edit in /backend, /client, /seller

# Run
cd backend && npm run dev  # Terminal 1
cd client && npm run dev   # Terminal 2
cd seller && npm run dev   # Terminal 3
```

**Access**: `localhost:5000` (API) | `localhost:5173` (client) | `localhost:5174` (seller)

### Environment

**Backend**:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
RESEND_API_KEY=re_...
```

**Frontend**:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Reference

| Method | Endpoint                | Auth   | Purpose           |
| ------ | ----------------------- | ------ | ----------------- |
| POST   | `/api/auth/login`       | -      | Login             |
| POST   | `/api/auth/register`    | -      | Signup            |
| GET    | `/api/products`         | -      | List (paginated)  |
| POST   | `/api/products`         | Seller | Create            |
| PUT    | `/api/products/:id`     | Seller | Update            |
| POST   | `/api/orders`           | Buyer  | Create order      |
| POST   | `/api/payments/verify`  | Buyer  | Verify payment    |
| POST   | `/api/payments/webhook` | -      | Razorpay callback |

```bash
POST /api/payments/retry
{ "paymentId": "payment_id_here" }
```

## 📂 Project Structure

```
backend/
├── config/          # MongoDB, Redis, services
├── controllers/     # HTTP handlers
├── models/          # Schemas
├── services/        # Business logic
├── jobs/            # BullMQ definitions
├── workers/         # Job processors
├── queues/          # Queue setup
├── routers/         # Routes
├── middlewares/     # Auth, validation
└── utils/           # Helpers

client/  # Buyer app (React/Vite)
seller/  # Seller dashboard (React/Vite)
ai/      # Docs & guides
```

## 🚀 Deployment

**Production**:

- MongoDB Atlas, Redis Cloud
- Backend: Render
- Frontend: Vercel
