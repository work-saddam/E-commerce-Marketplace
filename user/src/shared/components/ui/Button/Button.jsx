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
    "inline-flex items-center justify-center font-button font-bold transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "rounded-none bg-charcoal text-on-primary font-button text-button tracking-[0.2em] uppercase shadow-md hover:bg-black focus:ring-charcoal",
    secondary:
      "rounded border border-outline-variant bg-transparent text-charcoal hover:bg-surface-container focus:ring-outline font-button text-button uppercase",
    ghost:
      "rounded bg-transparent text-charcoal hover:bg-surface-container focus:ring-outline font-button text-button uppercase",
    tertiary:
      "bg-transparent text-secondary hover:text-charcoal underline underline-offset-4 decoration-1 focus:ring-outline font-button text-button uppercase p-0",
  };

  const sizes = {
    primary: "px-8 py-5",
    secondary: "px-4 py-3",
    ghost: "px-4 py-3",
    tertiary: "",
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
          className="mr-2 h-4 w-4 animate-spin text-current"
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
