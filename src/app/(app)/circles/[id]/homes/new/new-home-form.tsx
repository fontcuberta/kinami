"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, TextArea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewHomeForm({ circleId }: { circleId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const photosId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Tienes que iniciar sesión.");

      const photoUrls: string[] = [];
      if (files) {
        let i = 0;
        for (const file of Array.from(files)) {
          i += 1;
          setStatusMessage(`Subiendo foto ${i} de ${files.length}…`);
          const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("home-photos")
            .upload(path, file);
          if (uploadError) throw uploadError;
          const { data: pub } = supabase.storage.from("home-photos").getPublicUrl(path);
          photoUrls.push(pub.publicUrl);
        }
      }

      setStatusMessage("Guardando la casa…");
      const homeId = crypto.randomUUID();
      const { error: insertError } = await supabase.from("homes").insert({
        id: homeId,
        owner_id: user.id,
        title,
        description: description || null,
        city,
        country,
        photos: photoUrls,
      });
      if (insertError) throw insertError;

      const { error: shareError } = await supabase
        .from("home_circles")
        .insert({ home_id: homeId, circle_id: circleId });
      if (shareError) throw shareError;

      setStatusMessage("Casa guardada. Redirigiendo…");
      router.push(`/homes/${homeId}`);
      router.refresh();
    } catch (err) {
      setStatusMessage("");
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
      <Input
        label="Título"
        id="home-title"
        required
        placeholder="Ej. Apartamento en Valencia, zona Ruzafa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ciudad"
          id="home-city"
          required
          autoComplete="address-level2"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          label="País"
          id="home-country"
          required
          autoComplete="country-name"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>
      <TextArea
        label="Descripción"
        id="home-description"
        rows={4}
        hint="Habitaciones, zona, lo que quieras contar."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={photosId} className="text-sm font-semibold text-text">
          Fotos
        </label>
        <p id={`${photosId}-hint`} className="text-sm text-text-secondary">
          Opcional. Puedes seleccionar varias imágenes a la vez.
        </p>
        <input
          id={photosId}
          type="file"
          accept="image/*"
          multiple
          aria-describedby={`${photosId}-hint`}
          onChange={(e) => setFiles(e.target.files)}
          className="min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-base text-text file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-800"
        />
      </div>

      <div role="status" aria-live="polite" className="text-sm text-text-secondary">
        {statusMessage}
      </div>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="text-sm font-medium text-danger-700">
            {error}
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? "Guardando…" : "Guardar casa"}
      </Button>
    </form>
  );
}
