# Frontend Agent Specialization

**Agent Purpose**: React/Frontend development  
**Scope**: Components, pages, state management, styling, UX  
**Constraints**: Frontend only, no backend code

---

## 🎯 Activation Rules

This agent activates when working on:

- ✅ React components (`client/src/components/`, `seller/src/components/`)
- ✅ Pages and routes (`client/src/pages/`, `seller/src/pages/`)
- ✅ Redux state management (`store/`)
- ✅ UI styling (Tailwind CSS)
- ✅ API integration (Axios calls from frontend)
- ✅ Forms and validation
- ✅ Responsive design
- ❌ Backend APIs (redirect to backend.agent.md)
- ❌ Database schemas (redirect to db.agent.md)
- ❌ Server-side rendering (not in scope)

---

## 📋 Context Access (Load These First)

**Every response must reference:**

1. `ai/context/stack.md` - Frontend Stack section
2. `ai/context/conventions.md` - Code Style, React patterns
3. `ai/context/domain.md` - Business logic overview

**For implementation:** 4. `ai/prompts/component.prompt.md` - React patterns 5. `ai/guides/00-QUICK_START.md` - Common patterns 6. `ai/skills/api-development.md` - API integration

---

## 🏗️ Architecture Rules

### Component Structure (MANDATORY)

```
Functional Component (PascalCase)
  ↓
Props destructuring with defaults
  ↓
State management (useState)
  ↓
Effects (useEffect with cleanup)
  ↓
Event handlers (useCallback)
  ↓
Computed values (useMemo)
  ↓
JSX Markup
  ↓
Export with memo()
```

**Every component must follow this structure!**

### State Management Strategy

**Use Redux for:**

- ✅ User authentication state
- ✅ Cart data
- ✅ Global UI state (modals, notifications)

**Use Local State for:**

- ✅ Form inputs
- ✅ Loading flags
- ✅ Accordion/tab visibility
- ✅ Temporary UI state

**Pattern:**

```jsx
function MyComponent() {
  // Global state
  const user = useSelector(state => state.user.data);
  const dispatch = useDispatch();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effects
  useEffect(() => {
    // Fetch data, setup listeners
    return () => {
      // Cleanup: cancel requests, remove listeners
    };
  }, [dependencies]);

  // Render
  return (
    // JSX
  );
}

export default memo(MyComponent);
```

### Redux Integration

**Store structure:**

```javascript
// store/appStore.js
store: {
  user: {
    data: null,
    isLoading: false,
    error: null,
    token: null
  },
  cart: {
    items: [],
    total: 0
  }
}
```

**Dispatch pattern:**

```jsx
const dispatch = useDispatch();
dispatch(logout());
dispatch(addToCart({ productId, quantity }));
```

**Selector pattern:**

```jsx
const user = useSelector((state) => state.user.data);
const cartItems = useSelector((state) => state.cart.items);
```

---

## 🎨 Styling Rules

### Tailwind CSS (MANDATORY)

```jsx
// ✅ Use Tailwind utility classes
<div className="flex gap-4 md:gap-6 p-4 bg-gray-50 rounded-lg">
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Click me
  </button>
</div>

// ❌ Never use inline styles
<div style={{ display: 'flex', gap: '16px' }}>

// ❌ Never use CSS modules
import styles from './Component.module.css';
```

### Responsive Design (Mobile-First)

```jsx
// ✅ Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
</div>

// ✅ Breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### Dark Mode & Accessibility

```jsx
// ✅ Semantic HTML
<button aria-label="Close menu" onClick={handleClose}>
  ✕
</button>

// ✅ Color contrast
<p className="text-gray-900 bg-white"> {/* Passes WCAG AA */}

// ❌ Never use color alone to convey information
// Always add text or icons
```

---

## 🔗 API Integration Pattern

### Axios Configuration

```javascript
// utils/api.js - Already configured with:
// - withCredentials: true (for cookies)
// - Timeout: 10000ms
// - Base URL: process.env.VITE_BASE_URL

import api from "../utils/api";

// Use in components:
const response = await api.get("/products");
const response = await api.post("/orders", orderData);
```

### Data Fetching Hook

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        cancelTokenRef.current = new AbortController();
        const response = await api.get(url, {
          signal: cancelTokenRef.current.signal,
        });
        setData(response.data.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.response?.data?.message || "Failed to fetch");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => cancelTokenRef.current?.abort();
  }, [url]);

  return { data, isLoading, error };
}
```

### Error Handling Pattern

```jsx
const [errors, setErrors] = useState({});

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post("/orders", formData);
    // Success
    dispatch(setOrder(response.data.data));
  } catch (error) {
    if (error.response?.status === 400) {
      // Validation error - map to fields
      setErrors(error.response.data.errors);
    } else {
      // Server error
      setErrors({ submit: "Failed to create order. Please try again." });
    }
  }
};
```

---

## 📝 Form Handling Pattern

### Controlled Inputs

```jsx
function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    try {
      await api.post("/products", formData);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? "name-error" : undefined}
      />
      {errors.name && (
        <span id="name-error" className="text-red-600 text-sm">
          {errors.name}
        </span>
      )}
    </form>
  );
}
```

---

## 🔐 Security Rules (STRICT)

### Sanitize Output

```jsx
// ✅ Safe - React escapes by default
<p>{userInput}</p>

// ✅ Safe - Validate before rendering
<p>{sanitizeHTML(richContent)}</p>

// ❌ DANGEROUS - Never use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Protect Auth Token

```javascript
// ✅ Token in HTTP-only cookie (backend-set)
// ✅ Never access from JavaScript
// Cookie is sent automatically with requests

// ❌ Never store token in localStorage
localStorage.setItem("token", token);

// ❌ Never send token in URL
window.location = `/callback?token=${token}`;
```

### Validate User Input

```jsx
// ✅ Validate before sending to backend
if (!validator.isEmail(email)) {
  setError("Invalid email format");
  return;
}

// ✅ Backend validates again (defense in depth)
```

---

## ✅ Code Review Checklist

Before submitting any frontend code:

- [ ] Component follows structure (props → state → effects → render)
- [ ] Props have default values where appropriate
- [ ] Loading and error states displayed
- [ ] Uses `.lean()` for read-only data where possible
- [ ] Pagination implemented for lists
- [ ] No N+1 API calls (batch requests)
- [ ] useCallback used for event handlers
- [ ] useMemo used for expensive computations
- [ ] useEffect cleanup performed (cancel requests)
- [ ] Redux dispatch/selectors properly used
- [ ] Tailwind CSS only (no inline styles)
- [ ] Mobile-responsive design (md: breakpoints)
- [ ] Accessibility: labels, ARIA, keyboard navigation
- [ ] No console.log left in production
- [ ] No hardcoded API URLs
- [ ] Error messages user-friendly
- [ ] Form validation implemented
- [ ] Loading spinner shown during requests
- [ ] Component exported with memo()
- [ ] No prop drilling (use Redux for global state)

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake #1: N+1 API Calls

```jsx
// ❌ BAD: Loop with API call inside
{
  items.map((item) => <Item key={item.id} id={item.id} />);
}

function Item({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get(`/items/${id}`); // Called for every item!
  }, [id]);
}

// ✅ GOOD: Fetch all at once
useEffect(() => {
  const ids = items.map((i) => i.id);
  api.get("/items", { params: { ids } });
}, []);
```

### ❌ Mistake #2: Missing Dependency in useEffect

```jsx
// ❌ BAD: Dependencies missing
useEffect(() => {
  fetchData(userId);
}, []); // Will use stale userId!

// ✅ GOOD: All dependencies included
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### ❌ Mistake #3: State Updated in Render

```jsx
// ❌ BAD: Causes infinite loops
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Renders every frame!
  return <div>{count}</div>;
}

// ✅ GOOD: Use effects for side effects
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  }, []); // Run once on mount
  return <div>{count}</div>;
}
```

### ❌ Mistake #4: No Error Boundary

```jsx
// ❌ BAD: Component crashes entire app
function App() {
  return <ProductList />; // Could crash
}

// ✅ GOOD: Use error boundary
function App() {
  return (
    <ErrorBoundary>
      <ProductList />
    </ErrorBoundary>
  );
}
```

---

## 📖 When to Reference Other Agents

- **Backend API issues?** → `backend.agent.md`
- **Database schema needed?** → `db.agent.md`
- **Security concern?** → `security.agent.md`
- **State management confusion?** → Reference Redux patterns

---

## 🎓 Learn From Examples

Real implementations to study:

- `client/src/components/ProductCard.jsx` - Simple component
- `client/src/pages/cart/` - Complex page with state
- `client/src/store/userSlice.js` - Redux slice pattern
- `seller/src/components/Header.jsx` - Protected component

**Key takeaway**: Frontend development is about user experience, performance, and security.
Always handle loading/error states, validate input, and keep components focused and reusable.
