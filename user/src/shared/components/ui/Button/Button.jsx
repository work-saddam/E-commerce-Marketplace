
function Button({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100";

  const variants = {
    primary:
      "rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary-container focus:ring-primary",
    secondary:
      "rounded-full border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container focus:ring-outline",
    ghost:
      "rounded-full bg-transparent text-on-surface hover:bg-surface-container focus:ring-outline",
    tertiary:
      "bg-transparent text-primary hover:underline underline-offset-4 focus:ring-primary p-0",
  };

  const sizes = {
    primary: "px-8 py-4 text-base",
    secondary: "px-6 py-3 text-sm",
    ghost: "px-6 py-3 text-sm",
    tertiary: "text-sm",
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[variant] || sizes.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="mr-2 h-5 w-5 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

export default Button;
