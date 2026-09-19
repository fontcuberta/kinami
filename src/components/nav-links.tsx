"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";

export function NavLinks() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/circles", label: t("nav.circles") },
    { href: "/requests", label: t("nav.requests") },
    { href: "/account", label: t("nav.account") },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent-50 text-accent-700"
                : "text-text-secondary hover:bg-neutral-100 hover:text-text"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
