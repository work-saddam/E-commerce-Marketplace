# API Route Generation Prompt

**Used By**: Backend Agent, Code Generation  
**Input**: Endpoint requirements  
**Output**: Complete route with validation, error handling

---

## Template

```
You are building a REST API endpoint. Follow EXACTLY:

## Endpoint Requirements
- Method: [GET|POST|PUT|DELETE]
- Path: /api/v1/...
- Authentication: [required|optional|none]
- Authorization: [all|seller|admin|owner]

## Database Operations
- Model: [User|Product|Order|Payment|etc]
- Query: [findById|find|aggregate|custom]
- Indexes needed: []
- Relationships: []

## Validation Rules
- Fields: { fieldName: 'type|rules' }
- Business rules: []

## Response Format
Success: { message: string, data: T }
Error: { message: string, field?: string, code?: string }

## Implementation Checklist
□ Input validation BEFORE DB query
□ Permission check AFTER auth verification
□ Transaction wrapper if multi-step
□ Error handling with specific messages
□ Logging for failures
□ Response format consistent
□ No sensitive data in response
□ Paginate if returning list

## Code Template
\`\`\`javascript
// routers/productRouter.js
router.METHOD('/path', authMiddleware, async (req, res) => {
  try {
    // 1. Validate input
    // 2. Check permissions
    // 3. Database operation
    // 4. Format response
    res.status(200).json({ message: '...', data: result });
  } catch (error) {
    // Handle specific error types
    res.status(500).json({ message: 'Error message' });
  }
});
\`\`\`

## Testing Path
GET  /api/v1/products               → List products
POST /api/v1/products               → Create (seller only)
GET  /api/v1/products/:id           → Detail
PUT  /api/v1/products/:id           → Update (owner only)
DELETE /api/v1/products/:id        → Delete (owner only)
```

---

## Examples by Endpoint Type

### List Endpoint (GET /api/v1/products)

```javascript
// Query: Find with pagination, filtering, sorting
// Auth: None (public)
// Response: Array of objects

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;

    // Validation
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: "Invalid pagination" });
    }

    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    // Execute with lean() for read-only
    const products = await Product.find(query)
      .lean()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      message: "Products retrieved",
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Product list failed:", error);
    res.status(500).json({ message: "Failed to retrieve products" });
  }
});
```

### Create Endpoint (POST /api/v1/products)

```javascript
// Query: Insert with validation
// Auth: Seller required
// Response: Created object

router.post("/", authMiddleware, checkSellerStatus, async (req, res) => {
  try {
    // Validation
    const { name, price, stock, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be positive" });
    }

    if (stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    // Create with seller ID from JWT
    const product = new Product({
      ...req.body,
      sellerId: req.user.id,
    });

    await product.save();

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
});
```

### Update Endpoint (PUT /api/v1/products/:id)

```javascript
// Query: findByIdAndUpdate with permission check
// Auth: Seller required
// Authorization: Only owner can update

router.put("/:id", authMiddleware, checkSellerStatus, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Fetch product to check ownership
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Permission check
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update allowed fields only
    const allowedFields = ["name", "price", "stock", "description"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validation
    if (updates.price && updates.price <= 0) {
      return res.status(400).json({ message: "Price must be positive" });
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      message: "Product updated",
      data: updated,
    });
  } catch (error) {
    console.error("Product update failed:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});
```

### Delete Endpoint (DELETE /api/v1/products/:id)

```javascript
// Query: findByIdAndDelete with permission check
// Auth: Seller required
// Authorization: Only owner can delete

router.delete("/:id", authMiddleware, checkSellerStatus, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Soft delete: mark status as deleted
    await Product.findByIdAndUpdate(id, { status: "deleted" });

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product deletion failed:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});
```

---

## Common Patterns

### Pagination

```javascript
const { page = 1, limit = 20 } = req.query;
if (page < 1 || limit < 1 || limit > 100) {
  return res.status(400).json({ message: "Invalid pagination" });
}
const results = await Model.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### Filtering

```javascript
const { status, category, minPrice, maxPrice } = req.query;
const query = {};
if (status) query.status = status;
if (category) query.category = category;
if (minPrice || maxPrice) {
  query.price = {};
  if (minPrice) query.price.$gte = minPrice;
  if (maxPrice) query.price.$lte = maxPrice;
}
```

### Permission Check

```javascript
if (resource.userId.toString() !== req.user.id && req.user.role !== "admin") {
  return res.status(403).json({ message: "Unauthorized" });
}
```

### Error Responses

```javascript
// 400: Bad request (validation failed)
return res.status(400).json({ message: "Invalid data", field: "email" });

// 401: Unauthorized (not authenticated)
return res.status(401).json({ message: "Authentication required" });

// 403: Forbidden (authenticated but no permission)
return res.status(403).json({ message: "Unauthorized" });

// 404: Not found
return res.status(404).json({ message: "Resource not found" });

// 500: Server error
return res.status(500).json({ message: "Internal server error" });
```
