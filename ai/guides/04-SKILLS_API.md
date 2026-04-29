# 🎯 Backend API Development Skill

## Purpose

Comprehensive guide for building, debugging, and optimizing backend API endpoints with best practices for Express, MongoDB, and async operations.

## When to Use This Skill

- Building new REST endpoints
- Debugging failing API routes
- Optimizing query performance
- Adding validation/middleware
- Implementing error handling
- Working with transactions

---

## 1. API Endpoint Structure Template

```javascript
// ✅ GOOD: Consistent structure
const endpoint = async (req, res) => {
  try {
    // 1. Validate input
    const { field1, field2 } = req.body;
    if (!field1 || !field2) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // 2. Authorize user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 3. Business logic
    const result = await Model.findByIdAndUpdate(
      field1,
      { $set: { field2 } },
      { new: true, runValidators: true },
    );

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    // 4. Return success
    return res.status(200).json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    // 5. Error handling
    console.error("Endpoint error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
```

---

## 2. Validation Best Practices

### ❌ Bad Validation

```javascript
const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  // No validation! Vulnerable
  const user = await User.create({ name, email, password });
};
```

### ✅ Good Validation

```javascript
const validator = require("validator");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate each field
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be 2+ chars" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too weak" });
  }

  // Check duplicates
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({ name, email, password });
  res.status(201).json({ data: user });
};
```

---

## 3. Query Optimization

### ❌ Slow Queries

```javascript
// N+1 problem: 100 products = 100 seller queries
const getProducts = async (req, res) => {
  const products = await Product.find().limit(100);
  for (let product of products) {
    product.seller = await Seller.findById(product.sellerId); // ❌ 100 queries!
  }
  res.json(products);
};
```

### ✅ Optimized Queries

```javascript
// Single query with populate + lean (20% faster read-only)
const getProducts = async (req, res) => {
  const products = await Product.find()
    .populate({
      path: "seller",
      select: "shopName email rating", // Only needed fields
      lean: true,
    })
    .select("name price seller -__v") // Exclude unused fields
    .lean() // Read-only mode, no hydration
    .limit(100)
    .sort({ createdAt: -1 });

  res.json(products);
};

// For complex aggregations
const getOrderStats = async (req, res) => {
  const stats = await Order.aggregate([
    { $match: { seller: req.user.id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { count: -1 } },
  ]);
  res.json(stats);
};
```

---

## 4. Middleware Chain Pattern

```javascript
// ✅ Clean middleware composition
const authRequired = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  // Verify token...
  next();
};

const sellerOnly = (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Seller access required" });
  }
  next();
};

// Use in routes
router.post(
  "/products",
  authRequired,
  sellerOnly,
  validateProductInput,
  createProduct,
);
```

---

## 5. Error Handling Strategy

```javascript
// Create custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Global error handler (should be last middleware)
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({ message, error: err });
};

app.use(errorHandler);

// Usage in endpoints
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

---

## 6. Database Transactions

```javascript
const createOrderWithTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // All operations within transaction
    const order = new Order({
      buyer: req.user.id,
      items: req.body.items,
    });
    await order.save({ session });

    // Update inventory
    for (let item of req.body.items) {
      await Product.updateOne(
        { _id: item.id },
        { $inc: { stock: -item.quantity } },
        { session },
      );
    }

    await session.commitTransaction();
    res.status(201).json({ data: order });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Transaction failed" });
  } finally {
    session.endSession();
  }
};
```

---

## 7. Pagination Pattern

```javascript
// ✅ Reusable pagination
const paginate = async (Model, query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const data = await Model.find(query).skip(skip).limit(limit).lean();

  const total = await Model.countDocuments(query);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Usage
const getProducts = async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const query = category ? { category } : {};

  const result = await paginate(Product, query, page, limit);
  res.json(result);
};
```

---

## 8. Response Format Standards

### ✅ Consistent Response Structure

```javascript
// Success
{
  message: "Product created",
  data: { _id: "...", name: "..." }
}

// Error
{
  message: "Invalid input",
  errors: { email: "Invalid format" }
}

// List with pagination
{
  message: "Products retrieved",
  data: [{ ... }],
  pagination: { page: 1, limit: 10, total: 50 }
}
```

---

## 9. Input Sanitization

```javascript
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");

// Add to Express setup
app.use(helmet());
app.use(xss()); // Remove malicious HTML
app.use(mongoSanitize()); // Prevent NoSQL injection

// Custom sanitizer
const sanitizeInput = (obj) => {
  if (typeof obj !== "object") return obj;
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    }
  });
  return obj;
};
```

---

## 10. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

// Different limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 attempts
  message: "Too many attempts, try later",
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // 30 requests
});

router.post("/login", authLimiter, login);
router.get("/products", apiLimiter, getProducts);
```

---

## Testing API Endpoints

### Example with Supertest

```javascript
const request = require("supertest");
const app = require("../app");

describe("POST /api/products", () => {
  it("should create product if authenticated", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", "token=valid_jwt_token")
      .send({
        name: "Test Product",
        price: 999,
      });

    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
  });

  it("should reject if not authenticated", async () => {
    const res = await request(app).post("/api/products").send({ name: "Test" });

    expect(res.status).toBe(401);
  });
});
```

---

## Common Pitfalls to Avoid

1. ❌ **Returning sensitive data**: Don't return passwords, API keys
2. ❌ **Logging sensitive info**: Never log credit cards, tokens
3. ❌ **Not setting status codes**: Always set appropriate HTTP status
4. ❌ **Catching all errors the same way**: Handle different error types
5. ❌ **Missing validation**: Validate at boundary (API endpoint)
6. ❌ **Synchronous DB operations**: Always use async/await
7. ❌ **Not handling edge cases**: Check null, empty, invalid states
8. ❌ **Too many queries**: Use population, lean, aggregation

---

## Quick Checklist for New Endpoints

- [ ] Request validation added
- [ ] Authorization checks added
- [ ] Input sanitization done
- [ ] Database queries optimized
- [ ] Error handling implemented
- [ ] Response format consistent
- [ ] Status codes correct (201 for create, 200 for get, etc)
- [ ] Pagination added (if returning lists)
- [ ] Tests written
- [ ] API documentation updated
