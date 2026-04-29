# Code Conventions & Standards

**Last Updated**: April 28, 2026  
**Scope**: All backend and frontend code  
**Enforcement**: Linting rules + code review

---

## Naming Conventions

### Files & Directories

**Backend**

```
controllers/          → camelCase (authController.js)
models/              → camelCase (orderModel.js)
services/            → camelCase (orderService.js)
middlewares/         → camelCase (authMiddleware.js)
routers/             → camelCase (authRouter.js)
utils/               → camelCase (razorpay.js)
```

**Frontend**

```
components/          → PascalCase (ProductCard.jsx)
pages/               → PascalCase (SearchResults.jsx)
store/               → camelCase (cartSlice.js)
utils/               → camelCase (constants.js, helpers.js)
hooks/               → camelCase (useAuth.js)
```

### Variables & Functions

**Constants**

```javascript
const MAX_RETRY_ATTEMPTS = 3;
const CORS_WHITELIST = [...]
const PAYMENT_WEBHOOK_PATH = '/api/payment/webhook';
```

**Functions**

```javascript
// Backend - action verbs
async function fetchUserById(id) {}
function validateEmail(email) {}
async function createOrder(data) {}

// Frontend - action verbs or hooks
function handleSubmit() {}
function useAuthContext() {}
const loadProducts = async () => {};
```

**Variables**

```javascript
const userId = "123";
const isAuthenticated = true;
const userData = {...};
const items = [];
```

### Database & API

**Collections/Tables**

```
users
orders
products
sellers
payments
addresses
categories
```

**Fields** - snake_case in database, camelCase in code

```javascript
// DB: created_at
// Code: createdAt, updatedAt, deletedAt

// DB: user_id
// Code: userId

// DB: is_verified
// Code: isVerified
```

**URLs & Endpoints**

```
GET    /api/v1/products                     (list)
POST   /api/v1/products                     (create)
GET    /api/v1/products/:id                 (detail)
PUT    /api/v1/products/:id                 (update)
DELETE /api/v1/products/:id                 (delete)
POST   /api/v1/products/search             (custom action)

Nested: /api/v1/users/:userId/orders/:orderId
```

---

## Code Style

### JavaScript/Node.js

**ESLint Config**

```json
{
  "env": { "node": true, "es2021": true },
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
    "comma-dangle": ["error", "never"]
  }
}
```

**Spacing & Formatting**

```javascript
// ✅ Good
const user = await User.findById(id);
if (!user) {
  return res.status(404).json({ message: "Not found" });
}

// ❌ Bad
const user = await User.findById(id);
if (!user) {
  return res.status(404).json({ message: "Not found" });
}
```

### React/JSX

**Component Structure**

```jsx
// ✅ Good
function ProductCard({ id, name, price }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // setup
  }, [id]);

  const handleClick = () => {
    // action
  };

  return <div>{/* markup */}</div>;
}

// ❌ Bad
function ProductCard(props) {
  return <div>{props.name}</div>;
}
```

**Props & State**

```jsx
// ✅ Destructure props
function Header({ title, user, onLogout }) {}

// ✅ Meaningful state names
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [formErrors, setFormErrors] = useState({});

// ❌ Generic names
const [state, setState] = useState();
const [data, setData] = useState({});
```

---

## Error Handling

### Backend

**Controller Layer**

```javascript
// ✅ Specific error messages
if (!email) {
  return res.status(400).json({
    message: "Email is required",
    field: "email",
  });
}

// ❌ Generic errors
if (!email) {
  return res.status(400).json({ message: "Bad request" });
}
```

**Try-Catch Pattern**

```javascript
async function createOrder(req, res) {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ data: order });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid data" });
    }
    console.error("Order creation failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

### Frontend

**API Error Handling**

```javascript
try {
  const response = await api.post("/orders", orderData);
  setOrders([...orders, response.data]);
} catch (error) {
  if (error.response?.status === 400) {
    setErrors(error.response.data.errors);
  } else {
    setError("Failed to create order. Please try again.");
  }
}
```

---

## Comment Standards

**Backend - When to Comment**

```javascript
// ✅ Complex logic needs explanation
// Using lean() for read-only query - 15-20% faster than hydrated
const users = await User.find({ status: "active" }).lean();

// ✅ Non-obvious business logic
// Verify Razorpay signature before processing webhook
const verified = razorpayWebhookVerifier(req.rawBody, signature, secret);

// ❌ Obvious code doesn't need comments
const userId = req.user.id; // Get user ID
```

**Frontend - When to Comment**

```jsx
// ✅ Workarounds and hacks
// TODO: Replace with proper pagination once backend supports it
const items = data.slice(0, 10);

// ✅ Performance optimizations
// Memoize expensive selector to prevent re-renders
const selectUserOrders = useMemo(() => {...}, [userId]);

// ❌ Obvious code
const [isOpen, setIsOpen] = useState(false); // Is dialog open?
```

---

## Testing Convention

### File Naming

```
userController.js          → userController.test.js
productService.js          → productService.test.js
cartSlice.js              → cartSlice.test.js
```

### Test Structure

```javascript
// ✅ Descriptive test names
describe("UserService", () => {
  describe("findById", () => {
    it("should return user when found", async () => {});
    it("should return null when not found", async () => {});
    it("should throw error on database failure", async () => {});
  });
});
```

---

## Git Conventions

### Commit Messages

```
feat: add email verification to registration
fix: resolve N+1 query in order list endpoint
refactor: simplify authentication middleware
docs: update database setup instructions
test: add unit tests for payment service
chore: update dependencies

Format: type: description (lowercase, max 72 chars)
```

### Branch Names

```
feature/user-authentication
fix/payment-webhook-verification
docs/database-indexing-guide
chore/update-dependencies
```

---

## Documentation Standards

### Inline Documentation

```javascript
/**
 * Creates a new order and reserves inventory
 * @param {Object} orderData - Order details
 * @param {string} orderData.userId - User identifier
 * @param {Array} orderData.items - Products to order
 * @returns {Promise<Object>} Created order with transaction ID
 * @throws {ValidationError} If inventory unavailable
 */
async function createOrder(orderData) {}
```

### README Requirements

Every module should have:

- Purpose (1 sentence)
- Quick start (5 lines)
- Configuration needed
- Common errors & fixes
- Performance notes

---

## Security Conventions

**Input Validation**

```javascript
// ✅ Validate before processing
const email = req.body.email?.toLowerCase().trim();
if (!validator.isEmail(email)) {
  return res.status(400).json({ message: "Invalid email" });
}

// ❌ No validation
const email = req.body.email;
const user = await User.findOne({ email });
```

**Sensitive Data**

```javascript
// ✅ Never log sensitive data
logger.info(`User ${userId} login attempt`);

// ❌ Logs password or token
logger.info(`Login: ${email}:${password}`);
```

**Error Messages**

```javascript
// ✅ Generic for auth failures
return res.status(401).json({ message: "Authentication failed" });

// ❌ Reveals user existence
return res.status(401).json({ message: "Email not registered" });
```

---

## Performance Conventions

**Database Queries**

```javascript
// ✅ Use lean() for read-only
const products = await Product.find().lean();

// ✅ Select specific fields
const users = await User.find().select("email name");

// ❌ Full hydration for simple reads
const products = await Product.find();

// ❌ Load all fields
const users = await User.find();
```

**Frontend Rendering**

```jsx
// ✅ Memoize expensive components
const ProductList = memo(function ProductList({ items }) {
  return items.map((item) => <ProductCard key={item.id} {...item} />);
});

// ❌ Re-renders every time
function ProductList({ items }) {
  return items.map((item) => <ProductCard key={item.id} {...item} />);
}
```

---

## Code Review Checklist

- [ ] Follows naming conventions
- [ ] Proper error handling
- [ ] No console.log left in production code
- [ ] Security: no hardcoded secrets
- [ ] Performance: no N+1 queries
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No commented-out code blocks
- [ ] All variables/functions used
- [ ] No duplicate code
