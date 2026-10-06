"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleGroupIcon,
  KeyHomeIcon,
  ArrowUpRightIcon,
  ChatIcon,
  UserIcon,
} from "@/components/ui/icons";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { circleCopy } from "@/i18n/circles-experience";
import { experienceCopy } from "@/i18n/experience";
import { useI18n } from "@/i18n/client";

export function MobileTabBar() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const c = experienceCopy(locale);
  const hc = homeOwnershipCopy(locale);

  const tabs = [
    { href: "/circles", label: circleCopy(locale).nav, icon: CircleGroupIcon },
    { href: "/homes", label: hc.newTab, icon: KeyHomeIcon },
    { href: "/explore", label: c.homeNav, icon: ArrowUpRightIcon },
    { href: "/requests", label: t("nav.tabRequests"), icon: ChatIcon },
    { href: "/account", label: t("nav.tabAccount"), icon: UserIcon },
  ];

  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors ${
                  isActive ? "text-accent-700" : "text-text-secondary"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-accent-700" : ""}`}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
