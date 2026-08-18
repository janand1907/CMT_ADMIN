"use client";

import { useEffect, useRef, useState } from "react";

export function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 mt-1 min-w-[10rem] rounded-lg border border-gray-200 bg-white py-1 shadow-modal ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, className = "", ...props }) {
  return (
    <button
      className={`block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
