# 📌 AGENTS.md - Architecture Guide (Consolidated)

**Status**: Content moved to `/ai/guides/01-ARCHITECTURE.md` for better organization

---

## ✅ New Location

**→ [ai/guides/01-ARCHITECTURE.md](ai/guides/01-ARCHITECTURE.md)**

This consolidated structure provides:

- 🎯 Project architecture overview
- 🏗️ Technology stack reference
- 📁 File structure and organization
- ⚙️ Environment configuration
- 🔗 API endpoint reference
- ✅ Pre-deployment checklist

---

## 🚀 Quick Navigation

| Need             | Go To                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Start here**   | [ai/README.md](ai/README.md)                                       |
| **Architecture** | [ai/guides/01-ARCHITECTURE.md](ai/guides/01-ARCHITECTURE.md)       |
| **Quick ref**    | [ai/guides/00-QUICK_START.md](ai/guides/00-QUICK_START.md)         |
| **Debug issues** | [ai/guides/02-DEBUGGING.md](ai/guides/02-DEBUGGING.md)             |
| **API patterns** | [ai/guides/04-SKILLS_API.md](ai/guides/04-SKILLS_API.md)           |
| **DB patterns**  | [ai/guides/05-SKILLS_DATABASE.md](ai/guides/05-SKILLS_DATABASE.md) |

---

## 📝 Archive: Original Content Below

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
npm test         # Not configured - see IMPROVEMENTS section
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
  "https://trustkart-seller.vercel.app",
]; // Seller prod
```

**When adding new domains:**

1. Update `backend/src/server.js` CORS array
2. Ensure new origin is HTTPS in production
3. Test with `curl -H "Origin: https://newdomain.com" http://backend`

---

## 🎯 AI Agent Skills & Workflows

### 1. **API Development Skill**

**When to use**: Building new endpoints, fixing route issues
**Key practices**:

- Always validate input using schemas in `/validations`
- Use try-catch with specific error messages
- Return consistent JSON response format: `{ message, data, error }`
- Test CORS headers with OPTIONS requests
- Document endpoint behavior with examples

**Common patterns**:

```javascript
// ✅ Good error handling
const user = await User.findById(id);
if (!user) return res.status(404).json({ message: "User not found" });

// ❌ Avoid generic errors
if (!user) throw new Error("Error");
```

### 2. **Database & Query Optimization Skill**

**When to use**: Performance issues, N+1 queries, schema changes
**Key practices**:

- Use `.lean()` for read-only queries (15-20% faster)
- Use `.select()` to exclude unused fields
- Use `.session()` for transaction support
- Index frequently queried fields (email, phone)
- Use aggregation pipeline for complex queries

**Red flags to look for**:

- Missing indexes on `unique: true` fields
- `.populate()` without field selection
- Multiple queries in loops (N+1 problem)

### 3. **Job Queue Management Skill**

**When to use**: Background jobs, BullMQ issues, worker scaling
**Architecture**:

```
Job Definition (models) → Queue (redis) → Worker Process → Result
├─ Mail Queue: sendMail.js
└─ Inventory Queue: releaseInventory.js
```

**Key practices**:

- Job failures auto-retry with exponential backoff
- Failed jobs stored 7 days for debugging
- Always use Bull Board (/api/admin/queues) to monitor
- Implement idempotency for retryable jobs

### 4. **Frontend State Management Skill**

**When to use**: Redux store issues, data sync problems
**Redux structure**:

```javascript
store/
├─ appStore.js          // Store configuration
├─ userSlice.js         // Auth state
└─ cartSlice.js         // Shopping cart state
```

**Anti-patterns to avoid**:

- Storing API responses without normalization
- Dispatching actions from selectors
- Not using Redux Persist for cart/user data

### 5. **Payment Integration Skill**

**When to use**: Razorpay issues, webhook failures, refund logic
**Webhook verification**:

```javascript
// ✅ Always verify webhook signature
const verified = razorpayWebhookVerifier(req.rawBody, signature, secret);
// ❌ Never trust webhook data without verification
```

**Known TODOs in code**:

- [ ] Add idempotency key to payment requests (payment.service.js:78)

### 6. **Authentication & Security Skill**

**When to use**: Login issues, token expiry, session problems
**Critical checks**:

- JWT token in HTTP-only cookie + Authorization header
- `withCredentials: true` in all Axios calls
- Password hashing with bcrypt (10 salt rounds)
- SQL injection prevention via Mongoose/validation

---

## 🐛 Known Code Issues & Debugging Guide

### Critical Issues

#### ❌ Issue #1: Missing Test Suite

**Severity**: MEDIUM
**Location**: `package.json` (all 3 modules)
**Problem**: No tests configured; `npm test` will fail
**Fix**:

```bash
# Add Jest + Supertest for backend
npm install --save-dev jest supertest

# Update package.json scripts
"test": "jest --coverage"
"test:watch": "jest --watch"
```

#### ❌ Issue #2: Incomplete Idempotency in Payments

**Severity**: MEDIUM
**Location**: `backend/src/services/payment.service.js:78`
**Problem**: No idempotency key → duplicate charges on retry
**Fix**: Add MongoDB transaction IDs as idempotency keys

#### ❌ Issue #3: Missing Input Sanitization

**Severity**: LOW
**Location**: `backend/src/controllers/authController.js`
**Problem**: Email/phone not validated before DB lookup
**Fix**: Add `validator.isEmail()` and phone format checks

#### ❌ Issue #4: Weak Error Messages

**Severity**: LOW
**Location**: Multiple controllers
**Problem**: "Invalid Credentials" leaks user existence
**Fix**: Generic "Authentication failed" for both user-not-found and password-mismatch

#### ❌ Issue #5: Missing HTTPS Enforcement

**Severity**: HIGH
**Location**: `backend/src/server.js` (CORS cookie security)
**Problem**: `secure` flag only in production, but `sameSite: "none"` requires HTTPS
**Fix**:

```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: true, // Always require HTTPS for cookies
  sameSite: "strict",
  domain: process.env.COOKIE_DOMAIN,
});
```

#### ❌ Issue #6: No Rate Limiting

**Severity**: MEDIUM
**Location**: `backend/src/server.js`
**Problem**: Brute force attacks possible on auth endpoints
**Fix**: Add `express-rate-limit` middleware

#### ❌ Issue #7: Unvalidated File Uploads

**Severity**: HIGH
**Location**: `backend/src/middlewares/multer.js`
**Problem**: No file type/size validation before upload
**Fix**: Whitelist file types, enforce max size (5MB), scan for malware

---

## 📊 Performance Optimization Checklist

### Database

- [ ] Index email, phone in User & Seller collections
- [ ] Index product.\_id, seller.\_id, order.status
- [ ] Use `.lean()` for read-heavy queries
- [ ] Implement connection pooling (Mongoose default: 10)

### API Responses

- [ ] Paginate results (implement limit/skip)
- [ ] Use `.select()` to exclude unused fields
- [ ] Implement response compression (gzip)
- [ ] Add HTTP caching headers (ETag, Cache-Control)

### Frontend

- [ ] Code split pages with React.lazy()
- [ ] Optimize images with Cloudinary transformations
- [ ] Implement virtual scrolling for long lists
- [ ] Use Redux selector memoization (reselect)

### Jobs

- [ ] Monitor queue size (/api/admin/queues)
- [ ] Set worker concurrency based on CPU cores
- [ ] Implement circuit breaker for email service
- [ ] Add observability (Sentry, Datadog)

---

## 🎯 Agent Task Routing

### For Backend Development

1. **Reading files**: Use `semantic_search` for architecture overview, then `read_file` for specifics
2. **Debugging**: Check logs with `grep_search`, examine error stack traces
3. **Testing**: Use `run_in_terminal` to run Jest tests
4. **Database**: Verify indexes with MongoDB shell, check query plans

### For Frontend Development

1. **State issues**: Check Redux DevTools, verify selectors
2. **API issues**: Use browser Network tab, check Axios interceptors
3. **Performance**: Use Lighthouse, Chrome DevTools Profiler
4. **Styling**: Check CSS cascade, use browser inspector

### For Integration Issues

1. **CORS errors**: Verify origin in server.js, test preflight with curl
2. **Auth failures**: Check token expiry, verify cookie domain
3. **Payment webhooks**: Enable Razorpay test mode, verify webhook URL
4. **Email failures**: Check Resend API key, monitor BullMQ queue

---

## 📈 Token Optimization Strategies for AI

### Context Reduction

1. **First read**: Use `grep_search` with specific keywords (NOT full file)
2. **Parallel searches**: Combine independent queries in one batch
3. **Selective reads**: Read relevant line ranges, not entire files
4. **Smart exclusions**: Skip node_modules, dist/, .git/ directories

### Response Formatting

1. Use brief explanations with code snippets
2. Link to specific line numbers instead of pasting code
3. Avoid redundant context (user already knows project structure)
4. Focus on changes, not full file dumps

### Query Examples

**❌ Bad (High token cost)**

```
"Read the entire orderService.js file and explain the order creation flow"
```

**✅ Good (Optimized)**

```
"Find createOrder function in orderService.js, identify transaction handling"
```

---

## 🚨 Critical Debugging Paths

### Symptom: Auth Token Missing

1. Check: Browser DevTools → Application → Cookies → "token" cookie exists?
2. Check: Response Headers → Set-Cookie has `Secure, HttpOnly, SameSite`
3. Check: Frontend Axios config has `withCredentials: true`
4. Check: `backend/src/middlewares/authMiddleware.js` extracts from correct place

### Symptom: CORS Rejection

1. Check: Browser console → "Access-Control-Allow-Origin" header?
2. Verify: Frontend origin matches `server.js` CORS whitelist
3. Test: `curl -H "Origin: http://localhost:5173" http://localhost:4000/api/auth/login`
4. Check: Preflight request (OPTIONS) returns 200

### Symptom: Payment Webhook Not Received

1. Check: Razorpay Dashboard → Settings → Webhooks → URL is public
2. Verify: Webhook handler at `/api/payment/webhook` exists
3. Check: Raw body verification in `server.js` express.json middleware
4. Test: Use Razorpay CLI or curl to trigger test webhook

### Symptom: Job Queue Stuck

1. Check: `/api/admin/queues` BullMQ board → Stuck tab
2. Check: Redis connection: `redis-cli PING`
3. Check: Worker logs for exceptions
4. Fix: Clear stuck jobs: `queue.clean(30000, 0, 'wait')`

---

## 📚 API Endpoint Reference

### Authentication (`/api/auth`)

```
POST   /register           Register new user/seller
POST   /login              Authenticate & set token cookie
POST   /logout             Clear token cookie
GET    /verify             Check current auth status
```

### Products (`/api/products`)

```
GET    /                   List all products (paginated)
GET    /:id                Get product details
POST   /                   Create product (seller only)
PUT    /:id                Update product
DELETE /:id                Delete product
```

### Orders (`/api/seller` & `/api/users`)

```
POST   /orders             Create new order
GET    /orders             List user's orders
GET    /orders/:id         Get order details
PUT    /orders/:id         Update order status (seller)
```

### Payment (`/api/payment`)

```
POST   /create-order       Create Razorpay order
POST   /verify-payment     Verify & capture payment
POST   /webhook            Razorpay webhook (signed)
```

---

## ✅ Pre-Deployment Checklist

- [ ] All `.env` vars configured (no hardcoded secrets)
- [ ] MongoDB indexes created: `db.users.createIndex({ email: 1 }, { unique: true })`
- [ ] Redis connection pooling verified
- [ ] Rate limiting enabled on auth endpoints
- [ ] CORS origins updated for production domains
- [ ] Webhook URLs updated (Razorpay, Resend)
- [ ] SSL certificates valid and non-expired
- [ ] Monitoring alerts set up (Sentry, DataDog)
- [ ] Database backups automated daily
- [ ] Node.js version locked in `.nvmrc` or `package.json` `engines`
- [ ] Security headers added (helmet middleware)
- [ ] Load testing completed (k6, Artillery)

---

## 🔗 Related Files for Quick Reference

- **Core Config**: `backend/src/server.js`, `backend/src/config/database.js`
- **Auth Flow**: `backend/src/controllers/authController.js`, `backend/src/middlewares/authMiddleware.js`
- **Payment**: `backend/src/services/payment.service.js`, `backend/src/utils/razorpayWebhookVerifier.js`
- **Jobs**: `backend/src/workers/mail.worker.js`, `backend/src/workers/inventory.worker.js`
- **Redux**: `client/src/store/appStore.js`, `client/src/store/userSlice.js`

---

## 📝 Version History

- **v2.0** (2026-04-27): Comprehensive AI setup, debugging guide, skills, optimization
- **v1.0** (initial): Basic project overview
