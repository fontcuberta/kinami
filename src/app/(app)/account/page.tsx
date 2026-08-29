import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { whatsappSupportUrl } from "@/lib/support";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text">Mi cuenta</h1>
        <p className="mt-1 text-text-secondary">{user?.email}</p>
      </div>

      <section aria-labelledby="privacy-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="privacy-heading" className="text-xl font-semibold text-text">
            Privacidad
          </h2>
          <p className="mt-1 max-w-2xl text-text-secondary">
            Kinami no guarda tus datos más de lo necesario para que la app
            funcione. Solo los miembros de tu rueda ven tus casas y tu
            disponibilidad, no hay listados públicos, y nadie fuera de una
            solicitud de intercambio ve sus mensajes.
          </p>
        </div>
      </section>

      <section aria-labelledby="help-heading" className="flex flex-col gap-2">
        <h2 id="help-heading" className="text-xl font-semibold text-text">
          ¿Algún problema?
        </h2>
        <p className="max-w-2xl text-text-secondary">
          Escríbenos por WhatsApp y lo miramos.
        </p>
        <a
          href={whatsappSupportUrl("Hola, tengo una pregunta sobre Kinami")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm font-medium text-accent-700 underline-offset-2 hover:underline"
        >
          Abrir WhatsApp
        </a>
      </section>

      <section aria-labelledby="danger-heading" className="flex flex-col gap-4">
        <h2 id="danger-heading" className="text-xl font-semibold text-text">
          Borrar mi cuenta
        </h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
