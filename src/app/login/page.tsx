import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { LogoMark } from "@/components/ui/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="animated-blob-a absolute -left-32 -top-24 h-96 w-96 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-100), transparent 70%)" }}
        />
        <div
          className="animated-blob-b absolute -right-24 bottom-0 h-96 w-96 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-50), transparent 70%)" }}
        />
      </div>

      <main id="main-content" className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center gap-2 text-accent-700">
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-2xl font-semibold">Kinami</span>
        </Link>
        <div className="rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm">
          <h1 className="sr-only">Iniciar sesión</h1>
          <p className="mb-6 text-text-secondary">Entra en tu rueda de confianza.</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
