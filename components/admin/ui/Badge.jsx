const TONES = {
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-50 text-blue-700",
  indigo: "bg-indigo-50 text-indigo-700",
  purple: "bg-purple-50 text-purple-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  primary: "bg-primary-50 text-primary-700",
};

export function Badge({ children, tone = "gray", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone] || TONES.gray} ${className}`}
    >
      {children}
    </span>
  );
}
