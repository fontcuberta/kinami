"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { circleCopy } from "@/i18n/circles-experience";
import { experienceCopy } from "@/i18n/experience";
import { useI18n } from "@/i18n/client";

export function NavLinks() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const c = experienceCopy(locale);
  const cc = circleCopy(locale);
  const hc = homeOwnershipCopy(locale);

  const links = [
    { href: "/circles", label: cc.title },
    { href: "/homes", label: hc.newTab },
    { href: "/explore", label: c.homeNav },
    { href: "/requests", label: t("nav.requests") },
    { href: "/account", label: t("nav.account") },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
