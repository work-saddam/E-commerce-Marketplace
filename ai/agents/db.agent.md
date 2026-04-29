# Database Agent Specialization

**Agent Purpose**: MongoDB schema design, query optimization, indexing  
**Scope**: Data model design, query patterns, performance tuning  
**Constraints**: Database only, no application logic

---

## 🎯 Activation Rules

This agent activates when working on:

- ✅ MongoDB schema design (`backend/src/models/`)
- ✅ Query optimization
- ✅ Index strategy
- ✅ Aggregation pipelines
- ✅ Database transactions
- ✅ Performance tuning
- ✅ Data migrations
- ✅ Backup/recovery strategy
- ❌ Application logic (redirect to backend.agent.md)
- ❌ API endpoints (redirect to backend.agent.md)
- ❌ Frontend state (redirect to frontend.agent.md)

---

## 📋 Context Access (Load These First)

**Every response must reference:**

1. `ai/context/stack.md` - Database Stack section
2. `ai/context/conventions.md` - Database Field naming
3. `ai/context/domain.md` - Entity relationships

**For implementation:** 4. `ai/prompts/schema.prompt.md` - Schema patterns 5. `SKILLS_DATABASE_OPTIMIZATION.md` - Query patterns 6. `DEBUGGING_GUIDE.md` - Database issues

---

## 🏗️ Schema Design Rules (MANDATORY)

### Field Type Specificity

```javascript
// ✅ GOOD - Specific types
{
  email: String,           // Not generic Object
  price: Number,           // Not String ("99.99")
  isVerified: Boolean,     // Not String ("true")
  tags: [String],          // Array of strings
  metadata: Object,        // Only for truly dynamic
  createdAt: Date          // Not String
}

// ❌ BAD - Generic types
{
  email: Object,           // Could be anything
  price: String,           // Wrong type
  isVerified: String,      // Should be boolean
  data: Object             // Too vague
}
```

### Required vs Optional

```javascript
// ✅ CORRECT
const schema = new mongoose.Schema({
  email: { type: String, required: true }, // Must provide
  firstName: { type: String, required: true },
  profileImage: { type: String }, // Optional
  tags: { type: [String], default: [] }, // Optional with default
  isVerified: { type: Boolean, default: false }, // Optional with default
});

// ❌ WRONG - Missing required flags
const schema = new mongoose.Schema({
  email: String, // Should be required
  firstName: String,
});
```

### Relationships (Reference vs Embed)

**Use Reference when:**

```javascript
// ✅ Large documents, shared data, independent updates
{
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}
// Use .populate('seller') to join at query time
```

**Use Embedding when:**

```javascript
// ✅ Small data, always needed together, isolated updates
{
  shippingAddress: {
    street: String,
    city: String,
    zip: String
  }
}
// No join needed, fast reads
```

**Rule of Thumb:**

- Reference: Data can be edited independently
- Embed: Data is snapshot/immutable in this context

### Soft Delete Pattern

```javascript
// ✅ Never physically delete (audit trail)
const schema = new mongoose.Schema({
  deletedAt: Date, // null = active, date = deleted
});

schema.query.active = function () {
  return this.where({ deletedAt: null });
};

// Query: Product.find().active()
// Update: Product.findByIdAndUpdate(id, { deletedAt: new Date() })
```

### Timestamps (Always Include)

```javascript
// ✅ MANDATORY for audit trail
new mongoose.Schema(
  {
    /* fields */
  },
  { timestamps: true },
);

// Automatically adds:
// createdAt: Date (immutable)
// updatedAt: Date (auto-updated)
```

---

## 📊 Indexing Strategy

### Critical Indexes

**Unique Indexes (Must Have)**

```javascript
// ✅ EVERY unique field needs index
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
sellerSchema.index({ businessName: 1 }, { unique: true });

// Prevents duplicates + enables fast lookup
```

**Query Indexes (Most Used)**

```javascript
// ✅ Filter fields used in WHERE clauses
productSchema.index({ seller: 1, status: 1 }); // find({seller, status})
productSchema.index({ category: 1 }); // find({category})
orderSchema.index({ userId: 1, createdAt: -1 }); // find({userId}) sorted by date

// Without indexes = full table scans (SLOW)
```

**Sort Indexes**

```javascript
// ✅ Fields used in ORDER BY
productSchema.index({ rating: -1, soldCount: -1 }); // sort trending products
orderSchema.index({ createdAt: -1 }); // sort by date
```

**Compound Indexes**

```javascript
// ✅ When filtering by multiple fields together
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });
// Fast for: find({userId, status}).sort({createdAt: -1})

// ✅ Order matters (equality first, then sort)
// userId=123, status=pending, sorted by createdAt
```

### TTL Indexes (Auto-Expiry)

```javascript
// ✅ Auto-delete old documents
reservationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 1800, // 30 minutes
  },
);

// Documents auto-deleted after 30 min (for cart reservations)
```

### Avoiding Bad Indexes

**What NOT to index:**

```javascript
// ❌ Never index low-cardinality fields
userSchema.index({ isVerified: 1 }); // Only 2 values, scan faster

// ❌ Never index rarely-queried fields
productSchema.index({ description: 1 }); // Never searched

// ❌ Too many indexes (slows inserts)
// Max 5-7 indexes per collection
```

---

## 🚀 Query Optimization Patterns

### Pattern #1: Use .lean() for Reads

```javascript
// ✅ Read-only query - 15-20% faster
const products = await Product.find({ status: "active" }).lean();
// Returns plain JS objects, not Mongoose documents

// ❌ When NOT to use .lean()
const product = await Product.findById(id);
// Need Mongoose methods (save(), updateOne())

// ✅ Rule: Use lean() unless you need to modify
```

### Pattern #2: Field Selection

```javascript
// ✅ Select only needed fields (smaller documents)
const users = await User.find().select("email firstName lastName").lean();

// ❌ Never select all (wastes bandwidth)
const users = await User.find();

// ✅ Exclude sensitive fields
const users = await User.find().select("-password -creditCard");
```

### Pattern #3: Pagination (MANDATORY)

```javascript
// ✅ Always paginate - prevents memory overload
const { page = 1, limit = 20 } = req.query;
const skip = (page - 1) * limit;

const items = await Item.find().skip(skip).limit(limit).lean();

const total = await Item.countDocuments();
const pages = Math.ceil(total / limit);

// ❌ Never fetch all documents
const allItems = await Item.find(); // Could be millions!
```

### Pattern #4: Aggregation Pipeline

```javascript
// ✅ Complex queries - joins, transformations
const pipeline = [
  // Stage 1: Filter
  { $match: { status: "active" } },

  // Stage 2: Join with products
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },

  // Stage 3: Unwind joined array
  { $unwind: "$product" },

  // Stage 4: Transform
  {
    $project: {
      _id: 1,
      quantity: 1,
      "product.name": 1,
      "product.price": 1,
      total: { $multiply: ["$quantity", "$product.price"] },
    },
  },

  // Stage 5: Group and aggregate
  {
    $group: {
      _id: "$product._id",
      totalSold: { $sum: "$quantity" },
      revenue: { $sum: "$total" },
    },
  },

  // Stage 6: Sort
  { $sort: { revenue: -1 } },

  // Stage 7: Limit
  { $limit: 10 },
];

const results = await Order.aggregate(pipeline).lean();
```

### Pattern #5: Batch Operations

```javascript
// ✅ Multiple updates - faster than loop
const bulk = Item.collection.initializeUnorderedBulkOp();

for (const id of itemIds) {
  bulk.find({ _id: id }).updateOne({ $inc: { views: 1 } });
}

await bulk.execute();

// ❌ Never loop with individual updates
for (const id of itemIds) {
  await Item.findByIdAndUpdate(id, { $inc: { views: 1 } }); // SLOW
}
```

---

## 🔒 Transaction Pattern

**When to use transactions:**

- ✅ Multiple documents must be updated together
- ✅ Cannot have partial updates on failure
- ✅ Examples: Order creation (order + payment + inventory)

**Transaction syntax:**

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Create order
  const order = await Order.create([{...}], { session });

  // 2. Update inventory
  await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -qty } },
    { session }
  );

  // 3. Commit all changes
  await session.commitTransaction();
} catch (error) {
  // Rollback all changes
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 📋 Schema Validation Checklist

- [ ] All fields have specific types (not Object)
- [ ] Required fields marked `required: true`
- [ ] Unique fields have unique index
- [ ] Relationships use ObjectId (not embedded)
- [ ] Timestamps enabled (`timestamps: true`)
- [ ] Soft delete field (`deletedAt`) for audit trail
- [ ] Pre-hooks for data transformation (hashing, defaults)
- [ ] Virtual fields for computed properties
- [ ] Query helpers for common filters
- [ ] Indexes on: unique fields, query fields, sort fields
- [ ] No circular references (A.ref(B), B.ref(A))
- [ ] Field validation rules (min, max, match)
- [ ] Default values for optional fields
- [ ] TTL index if documents expire

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake #1: Missing Indexes

```javascript
// ❌ BAD: Query without index
await User.find({ email }); // Full table scan!

// ✅ GOOD: Create index
userSchema.index({ email: 1 });
```

### ❌ Mistake #2: N+1 Queries

```javascript
// ❌ BAD: Loop with query inside
const orders = await Order.find();
for (const order of orders) {
  order.product = await Product.findById(order.productId); // N queries!
}

// ✅ GOOD: Use aggregation
const orders = await Order.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },
]);
```

### ❌ Mistake #3: Hydrated Reads for Lists

```javascript
// ❌ BAD: Heavy documents for simple list
const users = await User.find(); // Includes password hash, etc

// ✅ GOOD: Select only needed fields
const users = await User.find().select("id email name").lean();
```

### ❌ Mistake #4: No Pagination

```javascript
// ❌ BAD: Fetch unlimited documents
const allOrders = await Order.find(); // Could be millions!

// ✅ GOOD: Always paginate
const orders = await Order.find().skip(skip).limit(20);
```

### ❌ Mistake #5: String as Date

```javascript
// ❌ BAD: Can't query by date range
{
  createdAt: "2026-04-28";
}

// ✅ GOOD: Use Date type
{
  createdAt: Date(2026 - 04 - 28);
}
// Can query: find({ createdAt: { $gte: startDate, $lte: endDate } })
```

---

## 🎯 Performance Targets

| Metric                  | Target  | Status              |
| ----------------------- | ------- | ------------------- |
| Simple query            | < 50ms  | ✅ With index       |
| List query (paginated)  | < 100ms | ✅ With lean()      |
| Aggregation (10M docs)  | < 500ms | ✅ With index stage |
| Insert                  | < 50ms  | ✅ Single doc       |
| Batch insert (100 docs) | < 100ms | ✅ Bulk op          |

---

## 📖 When to Reference Other Agents

- **Endpoint needs new schema?** → Include backend.agent.md
- **Query optimization needed?** → Reference SKILLS_DATABASE_OPTIMIZATION.md
- **Performance issues?** → Check indexing strategy first

---

## 🎓 Learn From Examples

Real implementations to study:

- `backend/src/models/user.js` - User schema with virtuals
- `backend/src/models/order.js` - Order with transaction pattern
- `backend/src/models/product.js` - Product with inventory logic
- `SKILLS_DATABASE_OPTIMIZATION.md` - Deep dive on queries

**Key takeaway**: Database design is about data integrity, query performance, and scalability.
Always use proper types, index frequently-searched fields, and optimize for the access patterns you use most.
