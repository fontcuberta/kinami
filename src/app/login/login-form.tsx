"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authRedirectOrigin } from "@/lib/https";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function loginErrorMessage(message?: string) {
  const detail = message?.trim();
  if (!detail) {
    return "No hemos podido enviar el enlace. Comprueba el email e inténtalo de nuevo.";
  }
  return `No hemos podido enviar el enlace. ${detail}`;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (!supabaseUrl || supabaseUrl.includes("TU-PROYECTO")) {
      setLoading(false);
      setError(
        loginErrorMessage(
          "Falta la Project URL de Supabase (https://xxxx.supabase.co) en .env.local."
        )
      );
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${authRedirectOrigin()}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(loginErrorMessage(error.message));
    } else {
      setSent(true);
    }
  }

  return (
    <>
      <div role="status" aria-live="polite">
        {sent && (
          <div className="rounded-lg border border-accent-100 bg-accent-50 p-4 text-accent-800">
            Te enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo
            desde este mismo dispositivo para entrar.
          </div>
        )}
      </div>

      {!sent && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Correo electrónico"
            id="login-email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Enviando…" : "Enviarme el enlace de acceso"}
          </Button>
        </form>
      )}
    </>
  );
}
