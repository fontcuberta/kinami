"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loginAuthErrorMessage } from "@/lib/auth-errors";
import { authRedirectOrigin } from "@/lib/https";
import { whatsappSupportUrl } from "@/lib/support";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        loginAuthErrorMessage(
          "Falta la Project URL de Supabase (https://xxxx.supabase.co) en .env.local."
        )
      );
      return;
    }

    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!supabaseKey || supabaseKey.includes("tu-clave")) {
      setLoading(false);
      setError(
        loginAuthErrorMessage(
          "Falta la clave publishable de Supabase en las variables de entorno."
        )
      );
      return;
    }

    const redirectTo = `${authRedirectOrigin()}/auth/callback`;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);
    if (error) {
      setError(loginAuthErrorMessage(error.message, redirectTo));
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

          {error && (
            <p className="text-sm text-text-secondary">
              ¿Sigue sin funcionar?{" "}
              <a
                href={whatsappSupportUrl(
                  `Hola, no me llega el enlace de acceso a Kinami (${email})`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-700 underline-offset-2 hover:underline"
              >
                Avisa por WhatsApp
              </a>
            </p>
          )}
        </form>
      )}
    </>
  );
}
