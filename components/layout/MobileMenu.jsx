"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenu({ navLinks, onNavigate }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div id="mobile-menu" className="border-t border-neutral-100 bg-white px-4 py-3 md:hidden">
      <ul className="space-y-1">
        {navLinks.map((item, index) => (
          <li key={item.href}>
            {item.children ? (
              <div>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex-1 rounded-lg px-3 py-2 font-medium text-neutral-700"
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={openIndex === index}
                    aria-label={`Toggle ${item.label} submenu`}
                    onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                    className="p-2 text-lg text-neutral-500"
                  >
                    {openIndex === index ? "−" : "+"}
                  </button>
                </div>
                {openIndex === index && (
                  <ul className="ml-4 space-y-1 border-l border-neutral-100 pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onNavigate}
                          className="block rounded-lg px-3 py-2 text-sm text-neutral-600"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link href={item.href} onClick={onNavigate} className="block rounded-lg px-3 py-2 font-medium text-neutral-700">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
