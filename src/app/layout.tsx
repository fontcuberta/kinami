import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s — Kinami",
    default: "Kinami — Homes within your circle",
  },
  description:
    "Intercambia casa con la gente en la que confías. Círculos privados de amigos y familia, repartidos por el mundo.",
};

// Aplica antes de pintar la preferencia de tema guardada, para que no
// haya parpadeo (flash) del tema equivocado al cargar. Si no hay ninguna
// guardada, no toca nada y manda el @media (prefers-color-scheme) del CSS.
const themeInitScript = `
  try {
    var t = localStorage.getItem('kinami-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg text-text font-sans" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
