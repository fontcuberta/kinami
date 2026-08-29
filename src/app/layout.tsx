import type { Metadata } from "next";
import { SkipLink } from "@/components/ui/skip-link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — Kinami",
    default: "Kinami — Homes within your circle",
  },
  description:
    "Intercambia casa con la gente en la que confías. Círculos privados de amigos y familia, repartidos por el mundo.",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg text-text font-sans" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
