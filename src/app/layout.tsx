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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        {children}
      </body>
    </html>
  );
}
