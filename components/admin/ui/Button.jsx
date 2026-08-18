import Link from "next/link";

const VARIANTS = {
  primary: "bg-primary-600 text-white shadow-soft hover:bg-primary-700 disabled:bg-primary-300",
  secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:text-gray-300",
  ghost: "text-gray-600 hover:bg-gray-100 disabled:text-gray-300",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-200",
  dangerSolid: "bg-red-600 text-white shadow-soft hover:bg-red-700 disabled:bg-red-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

function classes({ variant = "primary", size = "md", className = "" }) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ].join(" ");
}

export function Button({ variant, size, className, loading, children, disabled, ...props }) {
  return (
    <button className={classes({ variant, size, className })} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function LinkButton({ href, variant, size, className, children, ...props }) {
  return (
    <Link href={href} className={classes({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
