# Domain Knowledge Reference

**Last Updated**: April 28, 2026  
**Audience**: All AI agents  
**Purpose**: Understanding business logic and system architecture

---

## Business Domain

### Product Catalog

**Entities**

```
Product
├─ _id: ObjectId
├─ name: string (required, unique per seller)
├─ description: string
├─ category: ObjectId → Category
├─ seller: ObjectId → Seller (required)
├─ price: number (required, > 0)
├─ stock: number (default: 0)
├─ images: [{ url, public_id }]
├─ rating: number (0-5, calculated)
├─ status: enum ['active', 'inactive', 'delisted']
├─ createdAt: date (auto)
└─ updatedAt: date (auto)

Category
├─ _id: ObjectId
├─ name: string (unique)
├─ slug: string (unique)
├─ description: string
└─ icon: string (Cloudinary URL)
```

**Business Rules**

- Sellers can only modify own products
- Price must be > 0
- Stock can't be negative (handled by reservation system)
- Inactive products hidden from buyers
- Delisted products require admin approval to reactivate

### User & Authentication

**Entities**

```
User
├─ _id: ObjectId
├─ email: string (unique, required)
├─ phone: string (unique, required)
├─ password: string (bcrypt hashed, 10 rounds)
├─ firstName: string
├─ lastName: string
├─ role: enum ['buyer', 'seller', 'admin'] (default: buyer)
├─ isVerified: boolean (default: false)
├─ status: enum ['active', 'suspended', 'banned']
├─ profileImage: { url, public_id }
├─ addresses: [ObjectId] → Address
├─ lastLogin: date
├─ createdAt: date (auto)
└─ updatedAt: date (auto)

Seller
├─ _id: ObjectId → User
├─ businessName: string
├─ businessRegistration: string
├─ gst: string (optional)
├─ status: enum ['pending', 'approved', 'rejected', 'suspended']
├─ rating: number (0-5, calculated)
├─ totalOrders: number
├─ bankDetails: {
│   accountNumber: string
│   ifsc: string
│   accountName: string
│ }
├─ verificationDocuments: [{ url, public_id, type }]
├─ approvedAt: date
└─ rejectedAt: date
```

**Authentication Flow**

```
1. User registers (email + phone validation)
2. Password hashed (bcrypt 10 rounds)
3. JWT token issued (3-day expiry)
4. Token stored in HTTP-only cookie
5. Seller gets extra approval workflow
```

**Authorization Rules**

- Buyer: Can browse, order, review
- Seller: Can manage products, view orders, withdraw funds
- Admin: Full system access

### Order System

**Entities**

```
MasterOrder
├─ _id: ObjectId
├─ userId: ObjectId → User
├─ totalAmount: number
├─ totalItems: number
├─ status: enum ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
├─ createdAt: date
└─ orders: [ObjectId] → Order[]

Order
├─ _id: ObjectId
├─ masterOrderId: ObjectId → MasterOrder
├─ sellerId: ObjectId → Seller
├─ productId: ObjectId → Product
├─ quantity: number (> 0)
├─ price: number (snapshot at purchase)
├─ total: number (quantity × price)
├─ status: enum ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']
├─ shippingAddress: ObjectId → Address
├─ trackingNumber: string
├─ estimatedDelivery: date
└─ refund: ObjectId → Refund (optional)
```

**Order Workflow**

```
User adds to cart
    ↓
Checkout → Create master order
    ↓
Payment processing
    ↓
Payment webhook → Create individual orders + reserve inventory
    ↓
Seller notification
    ↓
Seller confirms (or auto-confirms after 24h)
    ↓
Inventory released from reservation
    ↓
Shipment tracking
    ↓
Delivery confirmation
```

**Inventory Reservation System**

```
Goal: Prevent overselling (concurrent purchases)

Mechanism:
1. On order creation: Reserve quantity from stock
2. Reservation expires in 30 minutes if not confirmed
3. On payment success: Confirm reservation
4. On payment failure: Release reservation
5. On cancellation: Release reservation back to stock

Stock = Total - Reserved - Sold
```

### Payment System

**Entities**

```
Payment
├─ _id: ObjectId
├─ masterOrderId: ObjectId → MasterOrder (required)
├─ razorpayOrderId: string
├─ razorpayPaymentId: string
├─ razorpaySignature: string
├─ amount: number
├─ currency: string (default: INR)
├─ status: enum ['created', 'captured', 'failed', 'refunded']
├─ method: string (card, netbanking, wallet, upi)
├─ metadata: Object
├─ createdAt: date
└─ updatedAt: date
```

**Payment Flow - CRITICAL**

```
1. Frontend requests order creation
   ↓
2. Backend creates Razorpay order + saves as 'created'
   ↓
3. Frontend displays Razorpay modal
   ↓
4. User completes payment
   ↓
5. Razorpay sends webhook to backend
   ↓
6. Backend VERIFIES signature (CRITICAL!)
   ↓
7. Backend updates payment to 'captured'
   ↓
8. Backend creates inventory reservation
   ↓
9. Backend releases inventory (async job)
```

**Webhook Verification - SECURITY CRITICAL**

```javascript
// NEVER trust webhook without signature verification
const hash = crypto
  .createHmac("sha256", SECRET)
  .update(orderId + "|" + paymentId)
  .digest("hex");

if (hash !== signature) {
  // REJECT webhook
  return res.status(403).json({ message: "Invalid signature" });
}
```

### Refund System

**Entities**

```
Refund
├─ _id: ObjectId
├─ orderId: ObjectId → Order
├─ paymentId: ObjectId → Payment
├─ reason: string (buyer_request, defective, wrong_item, etc)
├─ amount: number
├─ status: enum ['initiated', 'processed', 'completed', 'failed']
├─ razorpayRefundId: string
├─ initiatedAt: date
└─ completedAt: date
```

**Refund Workflow**

```
User initiates refund
    ↓
System verifies eligibility (within 30 days)
    ↓
Seller approval (or auto-approve after 48h)
    ↓
Payment API processes refund (async)
    ↓
Inventory restored to seller stock
    ↓
User notified via email
```

---

## Technical Architecture

### API Layers

**Request → Response Flow**

```
HTTP Request
    ↓
CORS Check → Middleware
    ↓
Auth Verification → Middleware
    ↓
Input Validation → Middleware
    ↓
Controller (route handler)
    ↓
Service (business logic)
    ↓
Model (database operations)
    ↓
Response (JSON)
```

### Database Relationships

**Key Patterns**

```
User (1) ←→ (many) Orders
User (1) ←→ (many) Addresses
Seller (1) ←→ (many) Products
Product (1) ←→ (many) Orders
Order (many) → (1) MasterOrder
```

**Critical Indexes**

```
users: unique(email), unique(phone)
products: sellerId, status, category
orders: userId, sellerId, status, createdAt
payments: masterOrderId, razorpayOrderId, status
```

### Job Queue Processing

**Mail Queue**

```
Trigger: Order created, payment received, refund processed
Output: Email to buyer/seller
Retry: 3 times, exponential backoff
TTL: 7 days
```

**Inventory Queue**

```
Trigger: Payment webhook received (delayed 30 min)
Action: Release reserved inventory to available stock
Retry: 5 times (inventory critical)
TTL: 30 days (keep for audit)
```

---

## Key Data Flows

### Buy Flow (Happy Path)

```
1. Browse products (search, filter by category)
2. View product details (rating, seller info, reviews)
3. Add to cart (stored in Redux)
4. Proceed to checkout
5. Enter shipping address
6. Select payment method
7. Complete payment via Razorpay
8. Payment webhook received + verified
9. Order created for each seller
10. Inventory reserved
11. Seller notified
12. Inventory confirmed (background job after 5 min)
13. Delivery in 3-5 days
```

### Sell Flow (Happy Path)

```
1. Register as seller
2. Submit verification documents
3. Admin reviews (approval/rejection)
4. Create product listing
5. Set price and stock
6. Monitor incoming orders
7. Confirm and ship
8. Share tracking number
9. Wait for delivery confirmation
10. Withdraw earnings to bank account
```

### Cart Management

```
Redux State
├─ items: [{ productId, quantity, price }]
├─ total: number
└─ lastUpdated: date

Persistence: localStorage (Redux Persist)
Sync: Manual dispatch on page load
Clear: On checkout completion
```

---

## Performance Considerations

### Query Optimization

```
❌ Slow: Loop and query
for (const productId of ids) {
  const product = await Product.findById(productId);
}

✅ Fast: Batch query
const products = await Product.find({ _id: { $in: ids } });

✅ Faster: With lean
const products = await Product.find({ _id: { $in: ids } }).lean();
```

### Caching Strategy

```
Redis Keys
├─ user:{userId} → User object (TTL: 1 hour)
├─ product:{productId} → Product object (TTL: 4 hours)
├─ category:* → Category list (TTL: 24 hours)
└─ cart:{sessionId} → Cart data (TTL: 7 days)
```

### Real-time Features

```
Currently: Polling (frontend checks status every 5 seconds)
Future: WebSockets for order updates
Future: Server-sent events for notifications
```

---

## Known Limitations

1. **File Uploads**: No async/streaming (synchronous upload)
2. **Search**: No full-text search index (basic filtering only)
3. **Notifications**: Email-only (no SMS, push notifications)
4. **Analytics**: No built-in analytics dashboard
5. **Transactions**: Limited to 4KB document size
6. **Scaling**: Single Redis instance (no cluster)
7. **Reports**: Manual query-based (no automated reports)

---

## Compliance & Security

### Data Protection

- PII (email, phone) hashed before storage
- Passwords: bcrypt 10 rounds, never logged
- Payment data: Never stored (Razorpay handles)
- HTTPS: Required in production

### Financial Compliance

- PCI DSS: Razorpay handles compliance
- Tax: GST captured from sellers
- Refunds: 30-day window enforced
- Currency: INR only (no multi-currency)

### Audit Trail

- All orders logged with timestamps
- Payment status changes immutable
- Refund history maintained
- Admin actions logged (TODO)
