# Security Agent Specialization

**Agent Purpose**: Security vulnerabilities, authentication, authorization, compliance  
**Scope**: Secure coding practices, threat modeling, compliance  
**Constraints**: Security focus across all layers

---

## 🎯 Activation Rules

This agent activates when working on:

- ✅ Authentication flows (login, signup, JWT)
- ✅ Authorization checks (roles, permissions)
- ✅ Input validation & sanitization
- ✅ Password handling & hashing
- ✅ Webhook signature verification
- ✅ CORS & security headers
- ✅ Sensitive data handling (PII, payments)
- ✅ Rate limiting & brute force prevention
- ✅ HTTPS & SSL/TLS enforcement
- ✅ Secret management
- ✅ SQL/NoSQL injection prevention
- ✅ XSS & CSRF prevention
- ✅ PCI compliance
- ✅ Data privacy & GDPR
- ✅ Audit logging

---

## 📋 Context Access (Load These First)

**Every response must reference:**

1. `ai/context/stack.md` - Security Defaults section
2. `ai/context/conventions.md` - Security Conventions
3. `ai/context/domain.md` - Compliance & Security

**For implementation:** 4. `ai/agents/security.agent.md` - Payment security 5. `ai/skills/api-development.md` - Validation and response patterns 6. `AGENTS.md` - Repository defaults

---

## 🔐 Authentication Rules (MANDATORY)

### JWT Implementation

```javascript
// ✅ CORRECT: 3-day expiry, HS256 signature
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "3 days", algorithm: "HS256" },
);

// ✅ CORRECT: Store in HTTP-only cookie
res.cookie("token", token, {
  httpOnly: true, // JavaScript cannot access
  secure: true, // HTTPS only (always in production)
  sameSite: "strict", // No third-party cookies
  domain: process.env.COOKIE_DOMAIN,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
});

// ❌ WRONG: Short expiry (too restrictive)
{
  expiresIn: "1 hour";
}

// ❌ WRONG: localStorage (vulnerable to XSS)
localStorage.setItem("token", token);

// ❌ WRONG: URL parameter (logged in access logs)
res.redirect(`/dashboard?token=${token}`);
```

### Password Hashing

```javascript
// ✅ CORRECT: bcrypt with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
await User.create({ email, password: hashedPassword });

// ✅ CORRECT: Verify on login
const isMatch = await bcrypt.compare(inputPassword, user.password);

// ❌ WRONG: Plaintext password stored
await User.create({ email, password });

// ❌ WRONG: MD5 or SHA1 (broken algorithms)
const hash = crypto.createHash("md5").update(password).digest();
```

### Session Management

```javascript
// ✅ CORRECT: Token extracted and verified
router.get("/protected", authMiddleware, (req, res) => {
  // req.user is verified payload
  res.json({ user: req.user });
});

// authMiddleware:
function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ❌ WRONG: Trust JWT without verification
function badMiddleware(req, res, next) {
  const token = req.cookies.token;
  req.user = jwt.decode(token); // No verification!
  next();
}
```

---

## 🛡️ Authorization Rules

### Role-Based Access Control (RBAC)

```javascript
// ✅ CORRECT: Check role before action
async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);

  // 1. Check authentication
  if (!req.user) return res.status(401).json({});

  // 2. Check authorization (role or ownership)
  if (
    product.sellerId.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // 3. Proceed with update
  await product.updateOne(req.body);
}

// ❌ WRONG: No authorization check
async function updateProduct(req, res) {
  await Product.findByIdAndUpdate(req.params.id, req.body);
}

// ❌ WRONG: Only check role (ignore ownership)
if (req.user.role !== "seller") return res.status(403).json({});
```

### Permission Hierarchy

```
Admin > Seller > Buyer

- Admin: Full system access
- Seller: Can only access own products/orders
- Buyer: Can only view public data + own orders
```

**Check pattern:**

```javascript
// ✅ CORRECT: Permission check matrix
const canAccess = {
  admin: true,
  seller: product.sellerId.equals(req.user.id),
  buyer: false,
};

if (!canAccess[req.user.role]) {
  return res.status(403).json({ message: "Forbidden" });
}
```

---

## ✅ Input Validation & Sanitization

### Email & Phone Validation

```javascript
// ✅ CORRECT: Validate format before DB query
const validator = require("validator");

if (!validator.isEmail(email)) {
  return res.status(400).json({ message: "Invalid email format" });
}

if (!validator.isMobilePhone(phone, "en-IN")) {
  return res.status(400).json({ message: "Invalid phone format" });
}

const user = await User.findOne({ email: email.toLowerCase().trim() });

// ❌ WRONG: No validation before DB query
const user = await User.findOne({ email: req.body.email });
```

### Password Validation

```javascript
// ✅ CORRECT: Enforce strong passwords
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) errors.push("Min 8 characters");
  if (!/[a-z]/.test(password)) errors.push("Needs lowercase");
  if (!/[A-Z]/.test(password)) errors.push("Needs uppercase");
  if (!/[0-9]/.test(password)) errors.push("Needs digit");
  if (!/[!@#$%^&*]/.test(password)) errors.push("Needs special char");

  return errors;
}

const errors = validatePassword(req.body.password);
if (errors.length > 0) {
  return res.status(400).json({ message: "Weak password", errors });
}

// ❌ WRONG: No validation
await User.create({ email, password: req.body.password });
```

### Input Sanitization

```javascript
// ✅ CORRECT: Remove dangerous content
const xss = require("xss");
const mongoSanitize = require("express-mongo-sanitize");

app.use(mongoSanitize()); // Remove $ and . from keys
app.use((req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  next();
});

const cleanName = xss(req.body.name); // Remove script tags

// ❌ WRONG: No sanitization
const name = req.body.name; // Could be: <script>alert('xss')</script>
```

---

## 🔗 API Security Headers

### CORS Configuration

```javascript
// ✅ CORRECT: Whitelist specific origins
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Dev: client
      "http://localhost:5174", // Dev: seller
      "https://trustkart-lemon.vercel.app", // Prod: client
      "https://trustkart-seller.vercel.app", // Prod: seller
    ],
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ❌ WRONG: Allow any origin (vulnerable)
app.use(cors({ origin: "*" }));
```

### Security Headers

```javascript
// ✅ CORRECT: Add helmet middleware
const helmet = require("helmet");

app.use(helmet());
// Sets:
// - Content-Security-Policy
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
// - Strict-Transport-Security (HSTS)
// - X-XSS-Protection

// ❌ WRONG: No security headers
// Browser won't protect against basic attacks
```

### HTTPS Enforcement

```javascript
// ✅ CORRECT: Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.header("x-forwarded-proto") !== "https"
  ) {
    return res.redirect(`https://${req.header("host")}${req.url}`);
  }
  next();
});

// ✅ CORRECT: Set HSTS header
app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  next();
});

// ❌ WRONG: Allow HTTP in production
// Cookies vulnerable to man-in-the-middle attacks
```

---

## 💳 Payment Security (CRITICAL)

### Webhook Signature Verification

```javascript
// ✅ CORRECT: ALWAYS verify before processing
router.post(
  "/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  async (req, res) => {
    const crypto = require("crypto");

    const hash = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== req.body.signature) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    // Now safe to process webhook
    const payment = req.body;
    await Payment.create(payment);
    res.status(200).json({ status: "ok" });
  },
);

// ❌ CRITICAL: Process without verification (SECURITY BREACH)
router.post("/webhook", async (req, res) => {
  const payment = req.body;
  await Payment.create(payment); // Attacker can fake payments!
});
```

### Idempotency Keys

```javascript
// ✅ CORRECT: Prevent duplicate charges on retry
const idempotencyKey = `${userId}-${orderId}-${Date.now()}`;

const existing = await Payment.findOne({ idempotencyKey });
if (existing) return existing; // Already processed

const payment = await razorpay.orders.create({
  amount: total,
  currency: "INR",
  receipt: idempotencyKey, // Use as idempotency key
});

await Payment.create({ idempotencyKey, razorpayOrderId: payment.id });
```

### No PII in Responses

```javascript
// ✅ CORRECT: Never return payment details
res.json({
  message: "Payment successful",
  transactionId: "txn_123",
  // NO: credit card, bank account, etc
});

// ❌ WRONG: Leaks sensitive data
res.json({
  message: "Payment successful",
  cardNumber: "4111-1111-1111-1111",
  cvv: "123",
});
```

---

## 🚨 Rate Limiting & Brute Force Prevention

### Login Endpoint Protection

```javascript
// ✅ CORRECT: Limit login attempts
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, try again later",
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

router.post("/login", loginLimiter, async (req, res) => {
  // Login logic
});

// ❌ WRONG: No rate limiting (brute force possible)
router.post("/login", async (req, res) => {
  // 1 million attempts per second!
});
```

### Frontend 429 Handling

```javascript
// ✅ CORRECT: Show the rate-limit message inline and keep it live
if (error.response?.status === 429) {
  const retryAfter = Number(error.response?.data?.retryAfter ?? 60);
  setCooldownEndsAt(Date.now() + retryAfter * 1000);
  setError(`Too many attempts. Try again in ${retryAfter}s.`);
}

// Disable submit while the cooldown is active.
<button disabled={isRateLimited}>Login</button>;
```

### General API Rate Limiting

```javascript
// ✅ CORRECT: Limit all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter);
```

---

## 📊 Error Messages (Don't Leak Info)

### Generic Authentication Errors

```javascript
// ✅ CORRECT: Generic message (doesn't leak if user exists)
if (!user || !bcrypt.compareSync(password, user.password)) {
  return res.status(401).json({ message: "Authentication failed" });
}

// ❌ WRONG: Reveals user doesn't exist (security vulnerability)
if (!user) {
  return res.status(401).json({ message: "Email not registered" });
}

if (!bcrypt.compareSync(password, user.password)) {
  return res.status(401).json({ message: "Password incorrect" });
}
```

### Validation Errors

```javascript
// ✅ CORRECT: Clear but not revealing
return res.status(400).json({
  message: "Validation failed",
  errors: {
    email: "Invalid email format",
    price: "Must be positive",
  },
});

// ❌ WRONG: Reveals database structure
return res.status(400).json({
  message: "Duplicate key error on email_1",
});
```

---

## 🔑 Secret Management

### Environment Variables (CRITICAL)

```javascript
// ✅ CORRECT: All secrets in .env
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const DB_PASSWORD = process.env.MONGODB_PASSWORD;

// Validate on startup
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("Invalid JWT_SECRET (min 32 chars)");
}

// ❌ WRONG: Hardcoded secrets
const JWT_SECRET = "secret123";
const DB_PASSWORD = "password";

// ❌ WRONG: Committed to git
// .env file in .gitignore
```

### .env.example (for team)

```
JWT_SECRET=your-32-char-secret-here
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=never-commit-this
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net
```

---

## ✅ Security Checklist

- [ ] All inputs validated before processing
- [ ] Authentication required for protected routes
- [ ] Authorization checked (role + ownership)
- [ ] Passwords hashed with bcrypt (10 rounds)
- [ ] Tokens in HTTP-only cookies
- [ ] CORS whitelist configured
- [ ] HTTPS enforced in production
- [ ] Security headers added (helmet)
- [ ] Rate limiting on auth endpoints
- [ ] Webhook signatures verified
- [ ] Idempotency keys for payments
- [ ] Error messages generic (no leaks)
- [ ] Sensitive data never logged
- [ ] SQL/NoSQL injection prevented (Mongoose)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF token on state-changing operations
- [ ] All secrets in .env (not hardcoded)
- [ ] Audit logging for sensitive operations
- [ ] PCI compliance for payments
- [ ] Regular security audits

---

## 🚨 Critical Security Focus

- 🔴 **Webhook verification** - Verify signatures before processing
- 🔴 **Cookie safety** - Use secure production cookie settings
- 🔴 **Input validation** - Validate all external input
- 🔴 **Rate limiting** - Protect public auth and payment paths
- 🟠 **Idempotency** - Prevent duplicate payment side effects
- 🟠 **HTTPS enforcement** - Require secure transport in production
- 🟠 **Safe errors** - Do not leak account existence or internal details

---

## 📖 When to Reference Other Agents

- **Backend endpoint security?** → Include backend.agent.md
- **Frontend authentication?** → Include frontend.agent.md
- **Database query injection?** → Include db.agent.md
- **Full security audit?** → Reference `ai/agents/security.agent.md` + `ai/context/conventions.md`

---

## 🎓 Learn From Examples

Real implementations to study:

- `backend/src/middlewares/authMiddleware.js` - JWT verification
- `backend/src/utils/razorpayWebhookVerifier.js` - Signature verification
- `backend/src/server.js` - CORS & helmet setup
- `ai/agents/security.agent.md` - Deep security patterns

**Key takeaway**: Security is not optional. Every layer must validate, authenticate, and authorize.
Never trust input, never trust external webhooks without verification, and always use HTTPS with proper headers.
