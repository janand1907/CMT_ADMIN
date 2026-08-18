const TONES = {
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

export function Alert({ tone = "info", title, children, className = "" }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${TONES[tone] || TONES.info} ${className}`}>
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={title ? "mt-1" : ""}>{children}</div>}
    </div>
  );
}
