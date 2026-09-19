import type { Metadata, Viewport } from "next";
import { SkipLink } from "@/components/ui/skip-link";
import { I18nProvider } from "@/i18n/client";
import { getLocale, getMessages, getTranslator } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: {
      template: "%s — Kinami",
      default: t("meta.defaultTitle"),
    },
    description: t("meta.description"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Aplica data-theme antes de pintar: preferencia guardada o sistema.
const themeInitScript = `
  try {
    var t = localStorage.getItem('kinami-theme');
    var theme = (t === 'light' || t === 'dark')
      ? t
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg text-text font-sans" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <I18nProvider locale={locale} messages={messages}>
          <SkipLink />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
