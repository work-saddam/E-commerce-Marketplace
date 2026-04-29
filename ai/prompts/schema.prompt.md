# MongoDB Schema Generation Prompt

**Used By**: DB Agent, Schema Design  
**Input**: Entity requirements  
**Output**: Mongoose schema with validation, indexes

---

## Template

```
You are designing a MongoDB schema. Follow EXACTLY:

## Entity Definition
- Name: [singular, lowercase]
- Purpose: [Brief description]
- Soft delete: [yes|no]
- Timestamps: [createdAt|updatedAt]

## Fields
- fieldName: { type: Type, required: boolean, unique: boolean, default: value }

## Relationships
- Foreign keys: [reference to other collection]
- Embedding vs Reference: [explain choice]
- Population strategy: [which fields to populate]

## Indexes
- Unique: [fields for uniqueness]
- Query: [fields for filtering/sorting]
- TTL: [expiry field if applicable]

## Validation
- Schema validation: [built-in Mongoose]
- Pre-save hooks: [password hashing, etc]
- Business rules: [constraints]

## Implementation Checklist
□ All required fields have `required: true`
□ Unique fields have unique index
□ Frequently queried fields indexed
□ Field types specific (not generic Object)
□ Default values for optional fields
□ Timestamps enabled
□ TTL index for auto-expiry if needed
□ Pre-hooks for data transformation
□ No circular references
□ Soft delete pattern for audit trail

## Code Template
\`\`\`javascript
const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  // ... fields
}, { timestamps: true });

// Indexes
schema.index({ email: 1 }, { unique: true });
schema.index({ status: 1, createdAt: -1 });

// Pre-hooks
schema.pre('save', async function(next) {
  // Transform/validate before save
  next();
});

// Virtual fields
schema.virtual('displayName').get(function() {
  return \`\${this.firstName} \${this.lastName}\`;
});

module.exports = mongoose.model('ModelName', schema);
\`\`\`

## Testing Path
- Insert with all required fields
- Insert missing required field → should fail
- Insert duplicate unique field → should fail
- Query by indexed field → should be fast
- Update and verify timestamps
```

---

## Examples by Entity Type

### User Schema (with virtual fields)

```javascript
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return by default
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },
    profileImage: {
      url: String,
      public_id: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    lastLogin: Date,
    deletedAt: Date, // Soft delete
  },
  { timestamps: true },
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// Pre-hooks
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const bcrypt = require("bcryptjs");
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual fields
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Query helpers
userSchema.query.active = function () {
  return this.where({ status: "active", deletedAt: null });
};

module.exports = mongoose.model("User", userSchema);
```

### Product Schema (with seller reference)

```javascript
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (v) => v > 0,
        message: "Price must be greater than 0",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0,
      // reserved + sold ≤ stock
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "delisted", "deleted"],
      default: "active",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    deletedAt: Date,
  },
  { timestamps: true },
);

// Indexes
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: "text", description: "text" }); // Full-text search
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1, soldCount: -1 }); // For sorting

// Pre-hooks
productSchema.pre("save", function (next) {
  // Validate stock vs reserved
  if (this.reserved > this.stock) {
    next(new Error("Reserved cannot exceed stock"));
  } else {
    next();
  }
});

// Virtual fields
productSchema.virtual("available").get(function () {
  return this.stock - this.reserved;
});

productSchema.virtual("sellerId", {
  ref: "User",
  localField: "seller",
  foreignField: "_id",
  justOne: true,
});

// Query helpers
productSchema.query.active = function () {
  return this.where({ status: "active" });
};

productSchema.query.bySeller = function (sellerId) {
  return this.where({ seller: sellerId });
};

module.exports = mongoose.model("Product", productSchema);
```

### Order Schema (with inventory tracking)

```javascript
const orderSchema = new mongoose.Schema(
  {
    masterOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterOrder",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number, // Snapshot at purchase time
      required: true,
    },
    total: {
      type: Number,
      required: true,
      default: function () {
        return this.quantity * this.price;
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    deliveredAt: Date,

    // Refund reference
    refund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Refund",
    },

    // Inventory reservation
    reservationId: String,
    reservedAt: Date,
    confirmationDeadline: Date,

    deletedAt: Date,
  },
  { timestamps: true },
);

// Indexes
orderSchema.index({ masterOrder: 1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 }); // For reporting
orderSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 2592000, // TTL: 30 days for soft cleanup
  },
);

// Pre-hooks
orderSchema.pre("save", async function (next) {
  if (!this.isModified("quantity") || !this.isModified("price")) {
    return next();
  }

  this.total = this.quantity * this.price;
  next();
});

// Post-hooks
orderSchema.post("save", async function (doc) {
  // Emit event for notification
  // emit('order.created', doc);
});

// Query helpers
orderSchema.query.byStatus = function (status) {
  return this.where({ status });
};

orderSchema.query.byBuyer = function (buyerId) {
  return this.where({ buyer: buyerId });
};

orderSchema.query.active = function () {
  return this.where({
    status: { $nin: ["cancelled", "refunded"] },
  });
};

module.exports = mongoose.model("Order", orderSchema);
```

### Payment Schema (with Razorpay integration)

```javascript
const paymentSchema = new mongoose.Schema(
  {
    masterOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterOrder",
      required: true,
      unique: true, // One payment per order
    },

    razorpay: {
      orderId: {
        type: String,
        required: true,
        unique: true,
      },
      paymentId: String,
      signature: String,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"], // Only INR for now
    },

    method: {
      type: String,
      enum: ["card", "netbanking", "wallet", "upi", "emi"],
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "captured", "failed", "refunded"],
      default: "created",
    },

    metadata: {
      type: Object,
      default: {},
    },

    refund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Refund",
    },

    failureReason: String,
    deletedAt: Date,
  },
  { timestamps: true },
);

// Indexes
paymentSchema.index({ masterOrder: 1 });
paymentSchema.index({ "razorpay.orderId": 1 });
paymentSchema.index({ "razorpay.paymentId": 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Hooks
paymentSchema.pre("save", function (next) {
  // Never allow status downgrade
  if (this.isModified("status")) {
    const validTransitions = {
      created: ["captured", "failed"],
      captured: ["refunded"],
      failed: [],
      refunded: [],
    };

    if (
      !validTransitions[this.constructor.statusBefore]?.includes(this.status)
    ) {
      next(new Error("Invalid status transition"));
    }
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
```

---

## Common Patterns

### Soft Delete

```javascript
const schema = new mongoose.Schema({
  deletedAt: Date,
});

schema.query.active = function () {
  return this.where({ deletedAt: null });
};
```

### Audit Trail

```javascript
const schema = new mongoose.Schema(
  {
    // ... fields
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updateReason: String,
  },
  { timestamps: true },
);
```

### TTL Index (auto-expiry)

```javascript
schema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 1 day
```

### Denormalization Strategy

```javascript
// Store frequently accessed data to avoid joins
product: {
  _id: ObjectId,
  name: String,
  price: Number // Copy from Product
}
```

### Validation with Custom Messages

```javascript
price: {
  type: Number,
  validate: {
    validator: (v) => v > 0,
    message: 'Price must be positive'
  }
}
```
