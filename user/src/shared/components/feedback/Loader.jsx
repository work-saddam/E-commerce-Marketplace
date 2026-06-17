function Loader({ size = "md", color = "primary", className = "" }) {
  const sizes = {
    sm: "h-6 w-6 stroke-[3px]",
    md: "h-12 w-12 stroke-[2px]",
    lg: "h-20 w-20 stroke-[1.5px]",
  };

  const colors = {
    primary: "text-primary",
    secondary: "text-secondary",
    white: "text-white",
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.primary;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-label="Page is loading"
    >
      <svg
        className={`animate-spin ${sizeClass} ${colorClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export default Loader;
