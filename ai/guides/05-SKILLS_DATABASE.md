# 🗄️ Database Query Optimization Skill

## Purpose

Master MongoDB performance optimization, query efficiency, and Mongoose best practices for high-performance applications.

## When to Use This Skill

- Slow API response times
- High database load/CPU usage
- Large result sets causing memory issues
- Complex queries with multiple populations
- Adding new features that need database work
- Performance audits and optimization

---

## 1. Index Strategy

### Create Required Indexes

```javascript
// User model - indexes on frequently queried fields
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// Product model
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });

// Order model (most important)
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Compound indexes for common queries
orderSchema.index({ buyer: 1, status: 1, createdAt: -1 });
productSchema.index({ seller: 1, category: 1, stock: 1 });
```

### Check Index Usage

```bash
# In MongoDB shell
db.users.getIndexes()
db.users.stats()
db.orders.aggregate([{ $indexStats: {} }])
```

---

## 2. Query Performance Patterns

### ❌ Slow Patterns

```javascript
// Pattern 1: No indexes used
const users = await User.find({ createdAt: { $gt: date } }); // Full collection scan

// Pattern 2: N+1 problem
const orders = await Order.find({ seller: sellerId });
const details = [];
for (let order of orders) {
  details.push(await User.findById(order.buyer)); // ❌ 100 queries for 100 orders!
}

// Pattern 3: Large populate
const orders = await Order.find()
  .populate("buyer")
  .populate("seller")
  .populate("items.product"); // Hydrates huge documents

// Pattern 4: Memory intensive
const allProducts = await Product.find(); // 1M+ documents in memory
const filtered = allProducts.filter((p) => p.price > 100);

// Pattern 5: Multiple queries for aggregation
const sellerRevenue = {};
const orders = await Order.find({ seller: sellerId });
for (let order of orders) {
  sellerRevenue[order.status] = sellerRevenue[order.status] || 0;
  sellerRevenue[order.status] += order.amount;
}
```

### ✅ Optimized Patterns

```javascript
// Pattern 1: Use index
const users = await User.find({ createdAt: { $gt: date } })
  .select("name email") // Only needed fields
  .lean();

// Pattern 2: Use populate (single query)
const orders = await Order.find({ seller: sellerId })
  .populate({
    path: "buyer",
    select: "name email -password",
    lean: true,
  })
  .lean();

// Pattern 3: Selective populate
const orders = await Order.find()
  .populate("buyer", "name email") // Only name and email
  .populate("seller", "shopName")
  .lean();

// Pattern 4: Server-side filtering with aggregation
const products = await Product.find({ price: { $gt: 100 } })
  .lean()
  .limit(1000);

// Pattern 5: Aggregation pipeline
const sellerRevenue = await Order.aggregate([
  { $match: { seller: sellerId } },
  {
    $group: {
      _id: "$status",
      total: { $sum: "$amount" },
      count: { $sum: 1 },
    },
  },
  { $sort: { total: -1 } },
]);
```

---

## 3. Lean vs Hydrated Documents

### When to Use `.lean()`

```javascript
// ✅ Use lean() for:
// - Read-only queries
// - Large result sets
// - Performance-critical paths
// - API responses

const products = await Product.find()
  .lean() // 15-20% faster
  .limit(100);
```

### When NOT to Use `.lean()`

```javascript
// ❌ Don't use lean() when:
// - You need document methods
// - You'll call .save()
// - You need virtuals

const user = await User.findById(userId); // NOT lean
user.password = hashedPassword;
await user.save(); // Needs Mongoose instance
```

---

## 4. Aggregation Pipeline (Advanced)

### Single Query Solution to Complex Problems

```javascript
// Problem: Get top 10 sellers by revenue, with product counts
const topSellers = await Order.aggregate([
  // Stage 1: Filter orders
  { $match: { createdAt: { $gte: new Date("2024-01-01") } } },

  // Stage 2: Group by seller
  {
    $group: {
      _id: "$seller",
      totalRevenue: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$amount" },
    },
  },

  // Stage 3: Sort by revenue
  { $sort: { totalRevenue: -1 } },

  // Stage 4: Limit to top 10
  { $limit: 10 },

  // Stage 5: Lookup seller details
  {
    $lookup: {
      from: "sellers",
      localField: "_id",
      foreignField: "_id",
      as: "sellerInfo",
    },
  },

  // Stage 6: Unwind and project
  { $unwind: "$sellerInfo" },
  {
    $project: {
      _id: 1,
      totalRevenue: 1,
      orderCount: 1,
      avgOrderValue: { $round: ["$avgOrderValue", 2] },
      sellerName: "$sellerInfo.shopName",
      sellerEmail: "$sellerInfo.email",
    },
  },
]);
```

### Performance Tips for Aggregation

1. Use `$match` early (filters documents before processing)
2. Use `$project` to exclude unused fields
3. Use `$limit` to reduce dataset size
4. Use `$lookup` after filtering/grouping (not before)
5. Avoid `$lookup` followed by `$unwind` (use `as: []` and index 0)

---

## 5. Batch Operations

### Bulk Write Operations (15-30x faster)

```javascript
// ❌ Slow: Update one-by-one
for (let seller of sellers) {
  await Seller.updateOne({ _id: seller.id }, { status: "verified" });
}

// ✅ Fast: Bulk operation
const bulkOps = sellers.map((seller) => ({
  updateOne: {
    filter: { _id: seller.id },
    update: { $set: { status: "verified" } },
  },
}));

await Seller.bulkWrite(bulkOps);
```

---

## 6. Select vs Exclude Fields

```javascript
// ✅ More efficient: Select only needed
const orders = await Order.find()
  .select("buyer seller amount status createdAt") // 5 fields
  .lean();

// ⚠️ Less efficient: Full document
const orders = await Order.find().lean();

// ⚠️ Only for huge documents with few exclusions
const orders = await Order.find()
  .select("-internalNotes -debugData -largeArray")
  .lean();
```

---

## 7. Connection Pooling & Performance

```javascript
// mongoose automatically pools connections
// Default: 10 connections per server

// Customize if needed:
const mongooseOptions = {
  maxPoolSize: 20, // Increase for high concurrency
  socketTimeoutMS: 45000,
};

mongoose.connect(uri, mongooseOptions);
```

---

## 8. Query Execution Analysis

```javascript
// Enable query logging in development
mongoose.set("debug", true);

// Or selective logging
const schema = new mongoose.Schema(/* ... */);
schema.pre("find", function () {
  console.log("Query:", this.getFilter());
  console.log("Start:", Date.now());
});
schema.post("find", function (result) {
  console.log("Duration:", Date.now() - startTime);
});

// Use MongoDB profiler
db.setProfilingLevel(2); // Log all operations
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty();
```

---

## 9. Transaction Best Practices

```javascript
// ✅ Correct transaction usage
const createOrderWithInventory = async (buyerId, items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Keep transaction short and focused
    const order = new Order({
      buyer: buyerId,
      items: items,
      total: calculateTotal(items),
    });
    await order.save({ session });

    // Update inventory atomically
    for (let item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session, new: true },
      );
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ❌ Common mistakes
// - Keep transaction too long
// - No retry logic for failures
// - Doing external API calls inside transaction
// - Not using session in all queries
```

---

## 10. Memory Management

```javascript
// Problem: Processing huge datasets
const allOrders = await Order.find();  // 100k documents in memory

// ✅ Solution 1: Stream processing
const stream = Order.find().stream();
stream.on('data', (order) => {
  processOrder(order);  // Process one at a time
});

// ✅ Solution 2: Cursor with batch processing
const cursor = Order.find().cursor();
while (const order = await cursor.next()) {
  processOrder(order);
}

// ✅ Solution 3: Pagination
const limit = 1000;
let skip = 0;
while (true) {
  const batch = await Order.find()
    .skip(skip)
    .limit(limit)
    .lean();

  if (batch.length === 0) break;
  batch.forEach(processOrder);
  skip += limit;
}
```

---

## 11. Common N+1 Scenarios & Fixes

### Scenario 1: Fetching author for each post

```javascript
// ❌ N+1: 1 query for posts + N queries for authors
const posts = await Post.find();
for (let post of posts) {
  post.author = await User.findById(post.authorId);
}

// ✅ Fixed
const posts = await Post.find().populate("authorId", "name email").lean();
```

### Scenario 2: Fetching product for each order item

```javascript
// ❌ N+1
const orders = await Order.find();
for (let order of orders) {
  for (let item of order.items) {
    item.product = await Product.findById(item.productId);
  }
}

// ✅ Fixed
const orders = await Order.find()
  .populate({
    path: "items.productId",
    select: "name price",
  })
  .lean();
```

---

## 12. Index Monitoring

```javascript
// Check which indexes are being used
db.users.aggregate([{ $indexStats: {} }]);

// Remove unused indexes
db.collection.dropIndex("index_name");

// Rebuild indexes
db.collection.reIndex();
```

---

## Database Performance Checklist

- [ ] All frequently queried fields have indexes
- [ ] Unique fields marked with `unique: true`
- [ ] `.lean()` used for read-only queries
- [ ] `.select()` used to exclude unused fields
- [ ] No N+1 queries (use `.populate()` or aggregation)
- [ ] Large result sets use pagination/streaming
- [ ] Complex queries use aggregation pipeline
- [ ] Transactions are kept short
- [ ] Connection pool size configured
- [ ] Query profiling done to find slow queries

---

## Quick Performance Wins

1. **Add indexes** (5-100x speedup)
2. **Use lean()** (15-20% faster for reads)
3. **Add pagination** (reduces memory/network)
4. **Use select()** (exclude unused fields)
5. **Fix N+1 queries** (10-100x speedup)
6. **Use aggregation** (for complex queries)
7. **Batch operations** (15-30x speedup)
