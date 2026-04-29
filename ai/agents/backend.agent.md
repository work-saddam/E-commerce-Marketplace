# Backend Agent Specialization

**Agent Purpose**: Node.js/Express API development  
**Scope**: Controllers, services, routers, middleware, database operations  
**Constraints**: Backend only, no frontend code

---

## 🎯 Activation Rules

This agent activates when working on:

- ✅ Express route handlers (`controllers/`)
- ✅ Business logic (`services/`)
- ✅ Database operations (`models/`)
- ✅ Middleware authentication/validation
- ✅ Job queue workers
- ✅ API integrations (Razorpay, Cloudinary, Resend)
- ❌ Frontend components (redirect to frontend.agent.md)
- ❌ Database schema design (redirect to db.agent.md)
- ❌ Security vulnerabilities (redirect to security.agent.md)

---

## 📋 Context Access (Load These First)

**Every response must reference:**

1. `ai/context/stack.md` - Backend Stack section
2. `ai/context/conventions.md` - Code Style, Error Handling
3. `ai/context/domain.md` - Business Domain, API Layers

**For implementation:** 4. `ai/prompts/api-route.prompt.md` - Endpoint patterns 5. `DEBUGGING_GUIDE.md` - Known issues 6. `SKILLS_API_BACKEND.md` - Deep patterns

---

## 🏗️ Architecture Rules

### Request Flow (MANDATORY)

```
HTTP Request
  ↓
CORS + Security Headers (middleware)
  ↓
Authentication Middleware (authMiddleware.js)
  ↓
Authorization Check (role-based)
  ↓
Input Validation (schemas in /validations)
  ↓
Controller (route handler)
  ↓
Service (business logic, transactions)
  ↓
Model (database query with .lean() if read-only)
  ↓
Response Formatting (JSON with message/data/error)
```

**Each layer must validate!** Don't skip layers.

### Error Handling (NON-NEGOTIABLE)

```javascript
// ✅ CORRECT
try {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "Success", data: user });
} catch (error) {
  console.error("User fetch failed:", error);
  res.status(500).json({ message: "Internal server error" });
}

// ❌ WRONG - Missing error handling, no specific messages
async function getUser(id) {
  const user = await User.findById(id);
  return user;
}
```

### Database Query Optimization

**When to use `.lean()`** (15-20% faster for read-only)

```javascript
// ✅ List endpoints - use lean
const products = await Product.find({ status: 'active' }).lean();

// ✅ Detail endpoint with aggregation - use lean
const analytics = await Order.aggregate([...]).lean();

// ❌ Detail endpoints that need methods - DON'T use lean
const product = await Product.findById(id); // Keep hydrated to access virtuals
```

**Pagination is MANDATORY for lists**

```javascript
const { page = 1, limit = 20 } = req.query;
if (limit > 100) limit = 100; // Prevent DoS

const skip = (page - 1) * limit;
const items = await Model.find().skip(skip).limit(limit).lean();
const total = await Model.countDocuments();

res.json({
  message: "Retrieved",
  data: items,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) },
});
```

---

## 🔐 Security Rules (STRICT)

### Input Validation

```javascript
// ✅ Always validate before DB query
if (!validator.isEmail(email)) {
  return res.status(400).json({ message: "Invalid email format" });
}

// ❌ Never skip validation
const user = await User.findOne({ email: req.body.email });
```

### Authentication Check

```javascript
// ✅ Verify JWT exists and is valid
const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
if (!token) {
  return res.status(401).json({ message: "Authentication required" });
}

// ❌ Never assume user exists
const userId = req.user.id; // Will crash if no auth middleware
```

### Permission Check

```javascript
// ✅ Check ownership before modification
if (resource.userId.toString() !== req.user.id) {
  return res.status(403).json({ message: "Unauthorized" });
}

// ❌ Never trust ownership
await Order.findByIdAndUpdate(orderId, updates); // Who owns it?
```

### Payment Webhook Verification (CRITICAL)

```javascript
// ✅ ALWAYS verify signature before processing
const verified = razorpayWebhookVerifier(
  req.rawBody,      // Raw request body (string)
  req.body.signature,
  process.env.RAZORPAY_KEY_SECRET
);

if (!verified) {
  return res.status(403).json({ message: 'Invalid signature' });
}

// Process webhook only after verification
const payment = await Payment.create({...});

// ❌ NEVER process without verification
// Payment webhook received - process immediately
```

### Error Messages (Don't Leak Info)

```javascript
// ✅ Generic for auth failures
return res.status(401).json({ message: "Authentication failed" });

// ❌ Reveals user existence (security vulnerability)
return res.status(401).json({ message: "Email not registered" });
```

---

## 📚 Implementation Patterns

### Create Endpoint Pattern

```javascript
// File: controllers/productController.js
async function createProduct(req, res) {
  try {
    // 1. Validate input
    const { name, price, stock, category } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Check permission
    if (req.user.role !== "seller") {
      return res.status(403).json({ message: "Sellers only" });
    }

    // 3. Business logic via service
    const product = await productService.createProduct({
      ...req.body,
      sellerId: req.user.id,
    });

    // 4. Return formatted response
    res.status(201).json({
      message: "Product created",
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid product data" });
    }
    console.error("Product creation failed:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
}
```

### Background Job Pattern

```javascript
// File: jobs/mail/orderConfirmation.js
module.exports = async (data) => {
  const { orderId, buyerEmail } = data;

  try {
    // Job-specific logic (idempotent!)
    const order = await Order.findById(orderId);
    if (order.emailSentAt) {
      return; // Already processed
    }

    // Send email
    await mailService.send({
      to: buyerEmail,
      template: "orderConfirmation",
      data: order,
    });

    // Mark as sent
    await Order.findByIdAndUpdate(orderId, { emailSentAt: new Date() });
  } catch (error) {
    console.error("Mail job failed:", error);
    throw error; // BullMQ will retry
  }
};
```

### Transaction Pattern (Multi-step Operation)

```javascript
// File: services/orderService.js
async function createOrder(orderData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create master order
    const masterOrder = await MasterOrder.create([{ ...orderData }], { session });

    // 2. Create individual orders for each seller
    const orders = await Order.insertMany(
      orderData.items.map(item => ({ masterOrderId: masterOrder[0]._id, ... })),
      { session }
    );

    // 3. Reserve inventory
    for (const order of orders) {
      await Product.findByIdAndUpdate(
        order.productId,
        { $inc: { reserved: order.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    return masterOrder[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## ✅ Code Review Checklist

Before submitting any backend code:

- [ ] Follows request flow (auth → validation → controller → service → model)
- [ ] Input validation BEFORE database query
- [ ] Permission check for modifications
- [ ] Specific error messages (not generic)
- [ ] Try-catch with appropriate error handling
- [ ] No console.log left in production code
- [ ] Pagination for list endpoints (limit ≤ 100)
- [ ] `.lean()` used for read-only queries
- [ ] No N+1 queries (use `.populate()` or aggregation)
- [ ] Database indexes exist for filtered/sorted fields
- [ ] No hardcoded secrets or API keys
- [ ] JWT authentication on protected routes
- [ ] Role-based authorization checked
- [ ] Response includes message + data fields
- [ ] Webhook signature verified before processing
- [ ] Tests added (or noted as TODO)
- [ ] No infinite loops or memory leaks
- [ ] Transactions used for multi-step operations

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake #1: N+1 Query

```javascript
// ❌ BAD: Loop with query inside
const orders = await Order.find();
for (const order of orders) {
  order.product = await Product.findById(order.productId); // N queries!
}

// ✅ GOOD: Use populate
const orders = await Order.find().populate("productId");

// ✅ ALSO GOOD: Aggregation pipeline
const orders = await Order.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
]);
```

### ❌ Mistake #2: Missing Index

```javascript
// ❌ BAD: Searching without index
await User.find({ email });

// ✅ GOOD: Index exists
userSchema.index({ email: 1 }, { unique: true });
```

### ❌ Mistake #3: Trust Webhook Without Verification

```javascript
// ❌ DANGEROUS: Process immediately
router.post('/webhook', (req, res) => {
  const payment = req.body; // Could be fake!
  await Payment.create(payment);
});

// ✅ SAFE: Always verify
router.post('/webhook', (req, res) => {
  const verified = razorpayWebhookVerifier(...);
  if (!verified) return res.status(403).json({});
  await Payment.create(payment);
});
```

### ❌ Mistake #4: Leak User Existence

```javascript
// ❌ EXPOSES: User registration status
if (!user) return res.status(401).json({ message: "User not found" });

// ✅ GENERIC: Same message for all failures
return res.status(401).json({ message: "Authentication failed" });
```

---

## 📖 When to Reference Other Agents

- **Frontend code needed?** → `frontend.agent.md`
- **Schema design needed?** → `db.agent.md`
- **Security concern?** → `security.agent.md`
- **Database optimization?** → `db.agent.md` + `SKILLS_DATABASE_OPTIMIZATION.md`
- **Payment issues?** → `security.agent.md` + `SKILLS_PAYMENT_SECURITY.md`

---

## 🎓 Learn From Examples

Real implementations to study:

- `backend/src/controllers/orderController.js` - Complex business logic
- `backend/src/services/orderService.js` - Transaction pattern
- `backend/src/services/payment.service.js` - Payment webhook verification
- `backend/src/workers/mail.worker.js` - Background job idempotency

**Key takeaway**: Backend development is about data integrity, security, and performance.
Always validate input, verify permissions, and optimize queries.
