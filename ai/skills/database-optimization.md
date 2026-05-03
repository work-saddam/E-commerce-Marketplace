# 🗄️ Database Optimization Skill

**Use When**: Slow queries, N+1 problems, query optimization, indexes, performance

---

## 1. Indexing Strategy

```javascript
// User model
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

// Order model (critical)
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ buyer: 1, status: 1, createdAt: -1 });
```

---

## 2. Query Patterns

```javascript
// ❌ Slow Patterns
const users = await User.find({ createdAt: { $gt: date } }); // No index
const orders = await Order.find({ seller: sellerId }); // N+1 with manual loop
for (let order of orders) {
  details.push(await User.findById(order.buyer)); // 100 queries for 100 orders!
}

// ✅ Optimized Patterns
const users = await User.find({ createdAt: { $gt: date } })
  .select("name email")
  .lean();

const orders = await Order.find({ seller: sellerId })
  .populate({
    path: "buyer",
    select: "name email -password",
    lean: true,
  })
  .lean();

// Complex aggregation (single query)
const stats = await Order.aggregate([
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

## 3. Lean vs Hydrated

```javascript
// ✅ Use .lean() for READ-ONLY queries (15-20% faster)
const products = await Product.find().lean().limit(100);

// ❌ Don't use .lean() when saving
const user = await User.findById(userId); // No lean
user.password = hashedPassword;
await user.save(); // Needs Mongoose instance
```

---

## 4. Advanced Aggregation

```javascript
// Get top 10 sellers by revenue with product counts
const topSellers = await Order.aggregate([
  { $match: { createdAt: { $gte: new Date("2024-01-01") } } },
  {
    $group: {
      _id: "$seller",
      totalRevenue: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$amount" },
    },
  },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "sellers",
      localField: "_id",
      foreignField: "_id",
      as: "sellerInfo",
    },
  },
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

// Aggregation Rules
// 1. Use $match early (filters before processing)
// 2. Use $project to exclude unused fields
// 3. Use $limit to reduce dataset
// 4. Use $lookup after filtering (not before)
```

---

## 5. Batch Operations (15-30x faster)

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

## 6. Field Selection

```javascript
// ✅ Select only needed fields (more efficient)
const orders = await Order.find()
  .select("buyer seller amount status createdAt")
  .lean();

// ❌ Full document (wasteful)
const orders = await Order.find().lean();
```

---

## 7. Transactions

```javascript
const createOrderWithInventory = async (buyerId, items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = new Order({
      buyer: buyerId,
      items: items,
      total: calculateTotal(items),
    });
    await order.save({ session });

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

// ❌ Common Mistakes
// - Keep transaction too long
// - No retry logic
// - External API calls inside transaction
// - Forgot session in a query
```

---

## 8. Memory Management for Large Datasets

```javascript
// ❌ Problem: All 100k documents in memory
const allOrders = await Order.find();

// ✅ Solution 1: Stream processing
const stream = Order.find().stream();
stream.on('data', (order) => {
  processOrder(order); // Process one at a time
});

// ✅ Solution 2: Cursor
const cursor = Order.find().cursor();
while (const order = await cursor.next()) {
  processOrder(order);
}

// ✅ Solution 3: Pagination
const limit = 1000;
let skip = 0;
while (true) {
  const batch = await Order.find().skip(skip).limit(limit).lean();
  if (batch.length === 0) break;
  batch.forEach(processOrder);
  skip += limit;
}
```

---

## 9. N+1 Scenarios

```javascript
// Scenario 1: Author for each post
// ❌ N+1
const posts = await Post.find();
for (let post of posts) {
  post.author = await User.findById(post.authorId);
}

// ✅ Fixed
const posts = await Post.find().populate("authorId", "name email").lean();

// Scenario 2: Product for each order item
// ❌ N+1
const orders = await Order.find();
for (let order of orders) {
  for (let item of order.items) {
    item.product = await Product.findById(item.productId);
  }
}

// ✅ Fixed
const orders = await Order.find()
  .populate({ path: "items.productId", select: "name price" })
  .lean();
```

---

## 10. Query Analysis & Monitoring

```javascript
// Check index usage
db.collection.aggregate([{ $indexStats: {} }]);

// Remove unused indexes
db.collection.dropIndex("index_name");

// MongoDB profiler
db.setProfilingLevel(2); // Log all operations
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty();
```

---

## ✅ Database Checklist

- [ ] Frequently queried fields indexed
- [ ] Unique fields marked `unique: true`
- [ ] `.lean()` used for read-only queries
- [ ] `.select()` excludes unused fields
- [ ] No N+1 queries
- [ ] Large result sets paginated or streamed
- [ ] Complex queries use aggregation
- [ ] Transactions kept short & focused
- [ ] Connection pool configured
- [ ] Query profiling completed

---

## Quick Performance Wins

1. **Add indexes** (5-100x speedup)
2. **Use .lean()** (15-20% faster reads)
3. **Add pagination** (reduces memory)
4. **Use .select()** (excludes unused fields)
5. **Fix N+1 queries** (10-100x speedup)
6. **Use aggregation** (for complex queries)
7. **Batch operations** (15-30x speedup)
