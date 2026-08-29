"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/circles", label: "Mis ruedas" },
  { href: "/requests", label: "Solicitudes" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-1 py-1 hover:text-accent-700 ${
              isActive ? "font-semibold text-accent-700" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
