# 🔍 Comprehensive Debugging Guide

## Senior Engineer Code Review & Issues Found

### 🚨 Critical Issues (Must Fix)

#### 3. **Auth Rate Limiting on Auth Routes**

**File**: `backend/src/server.js`
**Severity**: 🔴 CRITICAL
**Status**: Fixed with Redis-backed auth throttling and live 429 frontend feedback
**Current Behavior**:

- Buyer and seller login/register routes are limited to 5 requests per minute per IP
- Login routes skip successful requests
- `429` responses include JSON plus `Retry-After` and standard rate-limit headers
- Buyer and seller auth forms show a live inline countdown while blocked

**Solution**:

```javascript
const { loginLimiter, registerLimiter } = require("./middlewares/authRateLimit");

router.post("/login", loginLimiter, login);
router.post("/register", registerLimiter, register);
```

#### 4. **No File Type/Size Validation on Uploads**

**File**: `backend/src/middlewares/multer.js`
**Severity**: 🔴 CRITICAL
**Problem**:

- No file type whitelist
- No maximum file size
- Could upload malware or exhaust storage

**Solution**:

```javascript
const multer = require("multer");
const path = require("path");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }
  cb(null, true);
};

const upload = multer({
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});
```

#### 5. **Unverified Payment Webhooks**

**File**: `backend/src/services/payment.service.js`
**Severity**: 🔴 CRITICAL
**Problem**:

- Must verify webhook signature before processing
- Unverified webhooks = fraud vulnerability
- Attacker can fake payment confirmations

**Current Code**: Uses `razorpayWebhookVerifier` ✅ (GOOD)
**Ensure**: Raw body is preserved in Express middleware (already done in server.js)

---

### ⚠️ High Priority Issues

#### 6. **Missing Idempotency in Payment Processing**

**File**: `backend/src/services/payment.service.js` (line 78)
**Severity**: 🟠 HIGH
**Problem**:

```javascript
// TODO: later we can also add the idempotency key
// ❌ Retry could create duplicate orders!
```

**Impact**: Network retry → double charge
**Solution**:

```javascript
const idempotencyKey = `${buyerId}-${Date.now()}`; // or use MongoDB session ID

// Check if order already exists
const existingOrder = await MasterOrder.findOne({ idempotencyKey });
if (existingOrder) {
  return existingOrder; // Idempotent response
}

// Create new order
const order = await MasterOrder.create({ ...data, idempotencyKey });
```

#### 7. **No HTTPS Enforcement**

**File**: `backend/src/server.js`, `backend/src/controllers/authController.js`
**Severity**: 🟠 HIGH
**Problem**:

- No HSTS header
- CORS allows HTTP in production config
- Cookies not properly secured

**Solution**:

```javascript
const helmet = require("helmet");

app.use(helmet()); // Adds security headers including HSTS
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }),
);
```

#### 8. **N+1 Query in Order Fetching**

**File**: `backend/src/controllers/orderController.js`
**Severity**: 🟠 HIGH
**Problem**:

```javascript
// ❌ If there are 100 orders, this makes 100 seller lookups!
const orders = await Order.find({ buyer: userId });
for (let order of orders) {
  const seller = await Seller.findById(order.seller); // N+1!
}
```

**Solution**:

```javascript
// ✅ Fetch everything in 1 query
const orders = await Order.find({ buyer: userId })
  .populate({
    path: "seller",
    select: "shopName email", // Only fields needed
  })
  .lean(); // Read-only, 20% faster
```

#### 9. **Missing Database Indexes**

**File**: `backend/src/models/*.js`
**Severity**: 🟠 HIGH
**Problem**:

- Email, phone marked unique but no indexes
- No indexes on frequently queried fields
- Slow queries on large datasets

**Required Indexes**:

```javascript
// User model
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

// Product model
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });

// Order model
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
```

#### 10. **Weak Error Messages (Information Leakage)**

**File**: `backend/src/controllers/authController.js` (line 47-50)
**Severity**: 🟠 HIGH
**Problem**:

```javascript
// ❌ Reveals if email/user exists!
const field = existingUser.email == email ? "Email" : "Phone number";
return res.status(400).json({ message: `${field} already registered!` });
```

**Attack**: Attacker can enumerate all registered emails
**Solution**:

```javascript
// ✅ Generic message
if (existingUser) {
  return res.status(400).json({ message: "Registration failed. Try again." });
}
```

---

### 📌 Medium Priority Issues

#### 11. **No Input Sanitization for Strings**

**Severity**: 🟡 MEDIUM
**Problem**: XSS via stored data
**Fix**: Add sanitization middleware

```javascript
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

app.use(xss());
app.use(mongoSanitize());
```

#### 12. **Missing Logging & Monitoring**

**Severity**: 🟡 MEDIUM
**Problem**: Errors not logged, no visibility
**Solution**:

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Use in controllers
logger.error("Payment failed", { error, orderId });
```

#### 13. **No Environment Variable Validation**

**Severity**: 🟡 MEDIUM
**Problem**: Missing env vars crash server silently
**Solution**:

```javascript
// At startup
const requiredEnvs = ["PORT", "MONGODB_URI", "JWT_SECRET", "RAZORPAY_KEY_ID"];

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing required env: ${env}`);
  }
});
```

#### 14. **No CSRF Protection**

**Severity**: 🟡 MEDIUM
**Problem**: Cross-site request forgery possible
**Solution**:

```javascript
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// In response
res.json({ csrfToken: req.csrfToken() });
```

#### 15. **No API Versioning**

**Severity**: 🟡 MEDIUM
**Problem**: Breaking changes affect all clients
**Solution**: Use v1, v2 paths

```
/api/v1/products
/api/v2/products  // With new fields
```

---

### ✅ What's Working Well

1. ✅ JWT authentication properly implemented
2. ✅ Password hashing with bcrypt (10 rounds)
3. ✅ Transaction support with MongoDB sessions
4. ✅ BullMQ job queue architecture
5. ✅ Cloudinary integration for images
6. ✅ Redux Persist for state hydration
7. ✅ CORS properly configured for origins
8. ✅ Raw body preservation for webhook verification
9. ✅ Separate auth, user, seller routes
10. ✅ Mongoose schema validation

---

## 🛠️ Quick Fix Priority

**Do these first (High ROI):**

1. Review rate limiting behavior and frontend cooldown UX
2. Fix cookie security (5 min)
3. Add input validation (15 min)
4. Create database indexes (10 min)
5. Fix error messages (10 min)

**Total time: ~45 minutes for critical fixes**

---

## Testing Checklist

- [ ] Unit tests: Controllers, services, utils
- [ ] Integration tests: API endpoints with DB
- [ ] E2E tests: Complete user flows
- [ ] Load tests: 100+ concurrent users
- [ ] Security tests: OWASP Top 10
- [ ] Performance tests: Query optimization
