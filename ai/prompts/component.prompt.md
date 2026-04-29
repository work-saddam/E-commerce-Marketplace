# React Component Generation Prompt

**Used By**: Frontend Agent, Code Generation  
**Input**: Component requirements  
**Output**: Production-grade React component

---

## Template

```
You are building a React component. Follow EXACTLY:

## Component Specification
- Name: [PascalCase]
- Type: [Functional|Class|Custom Hook]
- Purpose: [Brief description]
- Props: { propName: 'type|validation' }
- State: [local|Redux|both]
- Effects: [fetch|validate|cleanup]

## UI Requirements
- Layout: [flex|grid|form|list]
- Responsive: [mobile|tablet|desktop]
- Accessibility: [labels|ARIA|keyboard]
- Styling: [Tailwind classes]

## Integration
- API calls: [endpoint|method]
- Redux: [slice|selectors|dispatch]
- Error handling: [display|retry|fallback]
- Loading state: [spinner|skeleton|disabled]

## Implementation Checklist
□ Destructure props with defaults
□ Use hooks (useState, useEffect, useContext)
□ Handle loading and error states
□ Validate props
□ Memoize expensive computations
□ Clean up effects (cancel requests)
□ Accessible markup with ARIA
□ Error boundary ready
□ No inline functions (use useCallback)
□ Performance: check re-renders

## Code Template
\`\`\`jsx
function ComponentName({ prop1, prop2 = 'default' }) {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  const handleAction = useCallback(() => {
    // Action
  }, [dependencies]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default memo(ComponentName);
\`\`\`

## Testing Checklist
- Component renders without props
- Props are applied correctly
- Event handlers work
- API calls made on mount
- Error states display
- Loading state displays
```

---

## Examples by Component Type

### List Component (with pagination, filtering)

```jsx
import { useState, useEffect, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import api from "../utils/api";

function ProductList({ category = null, onSelectProduct = null }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // Fetch products on mount or when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { page, limit };
        if (category) params.category = category;

        const response = await api.get("/products", { params });
        setProducts(response.data.data);
        setTotal(response.data.pagination.total);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, category]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading && products.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => setPage(page)} // Retry
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onSelect={() => onSelectProduct?.(product._id)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map(
          (p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-4 py-2 rounded ${
                page === p ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export default memo(ProductList);
```

### Form Component (with validation)

```jsx
import { useState, useCallback, memo } from "react";
import api from "../utils/api";

function ProductForm({ product = null, onSubmit = null, onCancel = null }) {
  const isEditing = !!product;
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || "",
    stock: product?.stock || "",
    description: product?.description || "",
    category: product?.category || "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be positive";
    if (!formData.category) newErrors.category = "Category is required";
    return newErrors;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `/products/${product._id}` : "/products";

        const response = await api[method.toLowerCase()](url, formData);
        onSubmit?.(response.data.data);
      } catch (error) {
        setErrors({
          submit: error.response?.data?.message || "Failed to save product",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditing, product?._id, validateForm, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="name" className="block font-semibold">
          Product Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-red-600 text-sm mt-1">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block font-semibold">
          Price *
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded ${
            errors.price ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={!!errors.price}
          aria-describedby={errors.price ? "price-error" : undefined}
        />
        {errors.price && (
          <p id="price-error" className="text-red-600 text-sm mt-1">
            {errors.price}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-100 text-red-700 rounded" role="alert">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default memo(ProductForm);
```

### Custom Hook (data fetching)

```jsx
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      cancelTokenRef.current = new AbortController();
      const response = await api.get(url, {
        signal: cancelTokenRef.current.signal,
        ...options,
      });
      setData(response.data.data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.response?.data?.message || "Failed to fetch data");
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    refetch();
    return () => cancelTokenRef.current?.abort();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export default useFetch;
```

---

## Common Patterns

### Loading States

```jsx
if (isLoading) return <Spinner />;
if (error) return <Error message={error} retry={refetch} />;
if (!data) return <Empty message="No data found" />;
```

### Controlled Inputs

```jsx
<input
  value={formData.field}
  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
/>
```

### Memoization

```jsx
const memoizedValue = useMemo(() => expensiveComputation(data), [data]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### Redux Integration

```jsx
const user = useSelector((state) => state.user.data);
const dispatch = useDispatch();
dispatch(logout());
```

### Error Boundary

```jsx
export function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return <div>Something went wrong</div>;

  return <React.Suspense fallback={<Spinner />}>{children}</React.Suspense>;
}
```
