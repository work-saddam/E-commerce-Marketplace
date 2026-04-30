# 🎯 API Development Skill

**Use When**: Building REST endpoints, validating input, handling errors, optimizing queries

---

## 1. Endpoint Structure

```javascript
const endpoint = async (req, res) => {
  try {
    // 1. Validate input
    const { field1, field2 } = req.body;
    if (!field1 || !field2) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Authorize user
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 3. Business logic
    const result = await Model.findByIdAndUpdate(
      field1,
      { $set: { field2 } },
      { new: true, runValidators: true },
    );

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    // 4. Return response
    return res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
```

---

## 2. Input Validation

```javascript
const validator = require("validator");

// ❌ Bad
const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password }); // No validation!
};

// ✅ Good
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be 2+ chars" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password too weak" });
  }

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

```javascript
// ❌ N+1 Problem: 100 products = 100 seller queries
const getProducts = async (req, res) => {
  const products = await Product.find().limit(100);
  for (let product of products) {
    product.seller = await Seller.findById(product.sellerId); // 100 queries!
  }
  res.json(products);
};

// ✅ Fixed: Single query with populate + lean
const getProducts = async (req, res) => {
  const products = await Product.find()
    .populate({
      path: "seller",
      select: "shopName email rating",
      lean: true,
    })
    .select("name price seller -__v")
    .lean()
    .limit(100)
    .sort({ createdAt: -1 });

  res.json(products);
};

// ✅ Complex aggregation
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

## 4. Middleware Chain

```javascript
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

## 5. Error Handling

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({ message, error: err });
};

app.use(errorHandler);

// Usage
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError("Product not found", 404);
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
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
    const order = new Order({
      buyer: req.user.id,
      items: req.body.items,
    });
    await order.save({ session });

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

## 7. Pagination

```javascript
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

## ✅ API Checklist

- [ ] All inputs validated
- [ ] Proper HTTP status codes used
- [ ] Error messages are specific but safe
- [ ] No hardcoded secrets in code
- [ ] Transactions used for multi-step operations
- [ ] Pagination implemented for lists
- [ ] N+1 queries fixed
- [ ] Database indexes optimized
