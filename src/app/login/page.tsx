import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 font-display text-4xl font-semibold text-accent-700">Kinami</h1>
      <p className="mb-8 text-text-secondary">Entra en tu rueda de confianza.</p>
      <LoginForm />
    </main>
  );
}
