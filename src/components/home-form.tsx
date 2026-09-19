"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AMENITY_KEYS, parseHomeAmenities, type HomeAmenities } from "@/lib/home-amenities";
import { Input, TextArea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import type { Home } from "@/lib/types";

type HomeFormProps =
  | { mode: "create"; circleId: string }
  | { mode: "edit"; home: Home };

export function HomeForm(props: HomeFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const photosId = useId();
  const existing = props.mode === "edit" ? props.home : null;
  const initialAmenities = parseHomeAmenities(existing?.amenities);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [houseManual, setHouseManual] = useState(existing?.house_manual ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [country, setCountry] = useState(existing?.country ?? "");
  const [amenities, setAmenities] = useState<HomeAmenities>(initialAmenities);
  const [keptPhotos, setKeptPhotos] = useState<string[]>(existing?.photos ?? []);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleAmenity(key: keyof HomeAmenities, has: boolean) {
    setAmenities((current) => ({
      ...current,
      [key]: { ...current[key], has },
    }));
  }

  function updateAmenityNotes(key: keyof HomeAmenities, notes: string) {
    setAmenities((current) => ({
      ...current,
      [key]: { ...current[key], notes },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(t("home.loginRequired"));

      const photoUrls = [...keptPhotos];
      if (files) {
        let i = 0;
        for (const file of Array.from(files)) {
          i += 1;
          setStatusMessage(t("home.uploading", { n: i, total: files.length }));
          const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("home-photos")
            .upload(path, file);
          if (uploadError) throw uploadError;
          const { data: pub } = supabase.storage.from("home-photos").getPublicUrl(path);
          photoUrls.push(pub.publicUrl);
        }
      }

      const payload = {
        title,
        description: description.trim() || null,
        house_manual: houseManual.trim() || null,
        city,
        country,
        photos: photoUrls,
        amenities,
      };

      if (props.mode === "create") {
        setStatusMessage(t("home.savingHome"));
        const homeId = crypto.randomUUID();
        const { error: insertError } = await supabase.from("homes").insert({
          id: homeId,
          owner_id: user.id,
          ...payload,
        });
        if (insertError) throw insertError;

        const { error: shareError } = await supabase
          .from("home_circles")
          .insert({ home_id: homeId, circle_id: props.circleId });
        if (shareError) throw shareError;

        setStatusMessage(t("home.savedRedirect"));
        router.push(`/homes/${homeId}`);
      } else {
        setStatusMessage(t("home.savingChanges"));
        const { error: updateError } = await supabase
          .from("homes")
          .update(payload)
          .eq("id", props.home.id)
          .eq("owner_id", user.id);
        if (updateError) throw updateError;

        setStatusMessage(t("home.savedRedirect"));
        router.push(`/homes/${props.home.id}`);
      }

      router.refresh();
    } catch (err) {
      setStatusMessage("");
      const message = err instanceof Error ? err.message : t("actions.generic");
      setError(
        message.toLowerCase().includes("amenities") || message.toLowerCase().includes("house_manual")
          ? t("home.migrationMissing")
          : message
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8" noValidate>
      <section aria-labelledby="home-basics-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="home-basics-heading" className="font-display text-xl font-semibold text-text">
            {t("home.basics")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{t("home.basicsHint")}</p>
        </div>
        <Input
          label={t("home.titleLabel")}
          id="home-title"
          required
          placeholder={t("home.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("home.city")}
            id="home-city"
            required
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label={t("home.country")}
            id="home-country"
            required
            autoComplete="country-name"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        <TextArea
          label={t("home.description")}
          id="home-description"
          rows={4}
          hint={t("home.descriptionHint")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <section aria-labelledby="home-amenities-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="home-amenities-heading" className="font-display text-xl font-semibold text-text">
            {t("home.equipment")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t("home.equipmentHint")}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {AMENITY_KEYS.map((key) => {
            const label = t(`amenities.${key}.label`);
            const hint = t(`amenities.${key}.hint`);
            const item = amenities[key];
            return (
              <li
                key={key}
                className="rounded-xl border border-border-subtle bg-surface p-4"
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--color-brand-fill)]"
                    checked={item.has}
                    onChange={(e) => toggleAmenity(key, e.target.checked)}
                  />
                  <span>
                    <span className="block font-semibold text-text">{label}</span>
                    <span className="mt-0.5 block text-sm text-text-secondary">{hint}</span>
                  </span>
                </label>
                {item.has && (
                  <div className="mt-3 pl-7">
                    <TextArea
                      label={t("home.howAmenity", { label })}
                      id={`amenity-notes-${key}`}
                      rows={2}
                      value={item.notes}
                      onChange={(e) => updateAmenityNotes(key, e.target.value)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="home-manual-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="home-manual-heading" className="font-display text-xl font-semibold text-text">
            {t("home.manualTitle")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {t("home.manualHint")}
          </p>
        </div>
        <TextArea
          label={t("home.manualLabel")}
          id="home-manual"
          rows={5}
          hint={t("home.manualFieldHint")}
          value={houseManual}
          onChange={(e) => setHouseManual(e.target.value)}
        />
      </section>

      <section aria-labelledby="home-photos-heading" className="flex flex-col gap-3">
        <div>
          <h2 id="home-photos-heading" className="font-display text-xl font-semibold text-text">
            {t("home.photosTitle")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {props.mode === "edit" ? t("home.photosHintEdit") : t("home.photosHintCreate")}
          </p>
        </div>

        {keptPhotos.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {keptPhotos.map((url, i) => (
              <li key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={t("home.currentPhoto", { n: i + 1 })}
                  className="h-28 w-full rounded-lg border border-border-subtle object-cover"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-md bg-surface/90 px-2 py-1 text-xs font-semibold text-text"
                  onClick={() => setKeptPhotos((photos) => photos.filter((photo) => photo !== url))}
                >
                  {t("home.removePhoto")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          id={photosId}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-base text-text file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-800"
        />
      </section>

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
        {loading ? t("common.saving") : props.mode === "edit" ? t("home.saveChanges") : t("home.saveHome")}
      </Button>
    </form>
  );
}
