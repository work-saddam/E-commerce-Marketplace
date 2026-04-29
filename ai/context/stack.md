# Technology Stack Reference

**Last Updated**: April 28, 2026  
**Used By**: All AI agents

---

## Backend Stack

### Runtime & Framework

- **Node.js**: 18+ (LTS)
- **Express**: 5.1.0+
- **Language**: JavaScript/ES2020+

### Database & Caching

- **MongoDB**: 6.0+ via Mongoose 8.18
- **Redis**: 7.0+ via IORedis 5.0+
- **Connection**: Mongoose pooling (default: 10), Redis replication for HA

### Job Queue & Background Processing

- **BullMQ**: 5.73.5 (Redis-backed job queue)
- **Pattern**: Producer → Queue (Redis) → Worker → Result
- **Concurrency**: Auto-scaled to CPU cores
- **Retry**: Exponential backoff, max 3 attempts

### Authentication & Security

- **JWT**: jsonwebtoken 9.0.0+
- **Hashing**: bcrypt 10 salt rounds
- **Cookie**: HTTP-only, Secure (HTTPS only), SameSite=Strict
- **Token Expiry**: 3 days
- **Signature**: HS256

### Payment Processing

- **Provider**: Razorpay 2.9.6
- **Integration**: Webhook verification (critical), Idempotency keys
- **Encryption**: HMAC-SHA256 signature verification
- **Flow**: Order → Payment → Webhook → Settlement

### File & Media Management

- **Provider**: Cloudinary 2.7.0
- **Types**: JPEG, PNG, WebP (5MB max)
- **URL Pattern**: `https://res.cloudinary.com/{cloud_name}/image/upload/...`
- **Transformations**: Auto-resize, compression

### Email Service

- **Provider**: Resend 6.12.2
- **Queue**: BullMQ mail queue
- **Template**: Handlebars via mailTemplates.js
- **Retry**: 3 attempts, exponential backoff

### Validation & Sanitization

- **Body Parser**: express.json() with 1MB limit
- **Validation**: Custom schemas in `/validations`
- **Sanitization**: xss-clean, express-mongo-sanitize (TODO)
- **Input Limits**: 255 chars for strings, 50 items for arrays

---

## Frontend Stack

### Framework & Build

- **React**: 18.3.1+
- **Bundler**: Vite 5.0+
- **Language**: JSX/ES2020+
- **CSS**: Tailwind CSS 3.4.1+

### State Management

- **Redux Toolkit**: 1.9.5+ (immutable state)
- **Redux Persist**: localStorage sync
- **Selectors**: Memoized with reselect (TODO)
- **DevTools**: Redux DevTools integration in dev

### HTTP Client

- **Axios**: 1.6.0+ with interceptors
- **Headers**: Content-Type: application/json
- **Credentials**: withCredentials: true (for cookies)
- **Timeout**: 10000ms (configurable via VITE_API_TIMEOUT)
- **Retry**: Manual, no auto-retry

### Styling & Components

- **CSS Framework**: Tailwind CSS utility-first
- **Icons**: Inline SVG or font-awesome
- **UI Library**: Custom components (no material-ui/chakra)
- **Responsive**: Mobile-first breakpoints

### Build Optimization

- **Code Splitting**: React.lazy() on route components
- **Asset Compression**: gzip by Vite
- **Image Optimization**: Cloudinary transformations
- **Bundle Analysis**: vite-plugin-visualizer (dev tool)

---

## Environment Configuration

### Backend .env

```
PORT=4000
NODE_ENV=development|production
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=min 32 chars, use strong random
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RESEND_API_KEY=re_...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ORIGINS=http://localhost:5173,https://trustkart-lemon.vercel.app
```

### Frontend .env

```
VITE_BASE_URL=http://localhost:4000/api
VITE_API_TIMEOUT=10000
```

---

## Performance Targets

### API Response Times

- **Simple queries** (status check): < 50ms
- **DB queries** (with lean): < 100ms
- **With join** (populate): < 200ms
- **List operations** (paginated): < 300ms
- **Payment webhook**: < 1000ms
- **Email queue**: < 500ms

### Database

- **Query latency**: < 100ms (p95)
- **Index coverage**: 100% (no full table scans)
- **Connection pool**: 10-20 connections
- **Batch write**: < 1000ms for 100 documents

### Frontend

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle size**: < 200KB gzipped

---

## Security Defaults

| Category          | Default          | Override               |
| ----------------- | ---------------- | ---------------------- |
| **Cookie Secure** | true (prod only) | Always true            |
| **CORS**          | Whitelist only   | Never allow \*         |
| **Rate Limit**    | 100 req/15min    | 5 req/1min for auth    |
| **Password Min**  | 8 chars          | 12 chars recommended   |
| **JWT Expiry**    | 3 days           | 24 hours for sensitive |
| **File Upload**   | 5MB              | 10MB max               |
| **HTTPS**         | Optional (dev)   | Required (prod)        |

---

## Testing Environment

### Unit Tests

- **Framework**: Jest 29.0+
- **Coverage**: Minimum 80%
- **Files**: `*.test.js` or `__tests__/`

### Integration Tests

- **Framework**: Supertest 6.0+
- **Database**: MongoDB Memory Server for tests
- **Port**: Random (avoid hardcoding)

### E2E Tests (Optional)

- **Framework**: Cypress or Playwright
- **Target**: Production-like environment
- **Headless**: true in CI/CD

---

## Deployment Stack

### Backend Hosting

- **Platform**: Vercel / Railway / Render
- **Node**: 18.x LTS
- **Memory**: 1GB minimum
- **Auto-scaling**: Yes

### Database Hosting

- **MongoDB Atlas**: Cluster M0 (dev) → M2+ (prod)
- **Backup**: Daily automated
- **Replica Set**: Yes (for transactions)

### Frontend Hosting

- **Platform**: Vercel / Netlify / GitHub Pages
- **CDN**: Global edge caching
- **DNS**: Cloudflare
- **SSL**: Let's Encrypt (auto-renew)

---

## Monitoring & Observability

### Logging

- **Service**: Winston logger (TODO)
- **Level**: error, warn, info, debug
- **Storage**: CloudWatch / Datadog

### Error Tracking

- **Service**: Sentry (optional)
- **Sampling**: 100% in prod

### Performance Monitoring

- **APM**: DataDog / New Relic (optional)
- **Metrics**: p50, p95, p99 latency

### Alerts

- **Error Rate**: > 1% triggers alert
- **Response Time**: p95 > 500ms triggers alert
- **Uptime**: < 99.9% triggers alert
