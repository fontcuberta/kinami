"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleGroupIcon, ChatIcon, UserIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/client";

export function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const tabs = [
    { href: "/circles", label: t("nav.tabCircles"), icon: CircleGroupIcon },
    { href: "/requests", label: t("nav.tabRequests"), icon: ChatIcon },
    { href: "/account", label: t("nav.tabAccount"), icon: UserIcon },
  ];

  return (
    <nav
      aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-accent-700" : "text-text-secondary"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-accent-700" : ""}`} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
