const controlBaseClass =
  "block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400";

const controlSizes = {
  md: "px-3 py-2 text-sm",
  sm: "px-2 py-1 text-xs",
};

const controlClass = `${controlBaseClass} ${controlSizes.md}`;

export function Field({ label, htmlFor, hint, error, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", rows = 4, ...props }) {
  return <textarea rows={rows} className={`${controlClass} ${className}`} {...props} />;
}

export function Select({ className = "", size = "md", children, ...props }) {
  return (
    <select className={`${controlBaseClass} ${controlSizes[size] || controlSizes.md} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${className}`}
        {...props}
      />
      {label}
    </label>
  );
}
