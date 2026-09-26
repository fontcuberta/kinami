"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useI18n } from "@/i18n/client";
import type { Profile } from "@/lib/types";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function ProfileSettingsForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const displayUrl = removeAvatar ? null : previewUrl || avatarUrl;

  function onPickFile(file: File | null) {
    setError(null);
    setSaved(false);
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      setError(t("account.avatarInvalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("account.avatarTooLarge"));
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
    setSaved(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    setStatusMessage("");

    try {
      const name = fullName.trim();
      if (name.length < 2) {
        throw new Error(t("account.fullNameRequired"));
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(t("home.loginRequired"));

      let nextAvatarUrl = removeAvatar ? null : avatarUrl;

      if (pendingFile) {
        setStatusMessage(t("account.avatarUploading"));
        const ext = extensionFor(pendingFile.type);
        const path = `${user.id}/avatar.${ext}`;

        // Remove previous formats so only one avatar file remains.
        await supabase.storage
          .from("avatars")
          .remove([
            `${user.id}/avatar.jpg`,
            `${user.id}/avatar.jpeg`,
            `${user.id}/avatar.png`,
            `${user.id}/avatar.webp`,
          ]);

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, pendingFile, { upsert: true, contentType: pendingFile.type });

        if (uploadError) {
          const msg = uploadError.message.toLowerCase();
          if (msg.includes("bucket") || msg.includes("not found") || msg.includes("avatars")) {
            throw new Error(t("account.avatarMigrationMissing"));
          }
          throw uploadError;
        }

        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        nextAvatarUrl = `${pub.publicUrl}?v=${Date.now()}`;
      } else if (removeAvatar && avatarUrl) {
        await supabase.storage
          .from("avatars")
          .remove([
            `${user.id}/avatar.jpg`,
            `${user.id}/avatar.jpeg`,
            `${user.id}/avatar.png`,
            `${user.id}/avatar.webp`,
          ]);
        nextAvatarUrl = null;
      }

      setStatusMessage(t("account.saving"));
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          phone: phone.trim() || null,
          avatar_url: nextAvatarUrl,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(nextAvatarUrl);
      setPendingFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setRemoveAvatar(false);
      setSaved(true);
      setStatusMessage("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("actions.generic");
      setError(message);
      setStatusMessage("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar
          userId={profile.id}
          fullName={fullName || profile.full_name}
          avatarUrl={displayUrl}
          size="xl"
          className="shadow-[0_12px_30px_rgba(27,33,48,0.12)]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm font-semibold text-text">{t("account.avatar")}</p>
          <p className="text-sm text-text-secondary">{t("account.avatarHint")}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <input
              ref={fileRef}
              id={fileId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              {displayUrl ? t("account.avatarChange") : t("account.avatarUpload")}
            </Button>
            {(displayUrl || avatarUrl) && !removeAvatar ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={clearPhoto}
                disabled={loading}
              >
                {t("account.avatarRemove")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("account.fullName")}
          id="profile-full-name"
          name="full_name"
          required
          autoComplete="name"
          hint={t("account.fullNameHint")}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSaved(false);
          }}
        />
        <Input
          label={t("account.phone")}
          id="profile-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint={t("account.phoneHint")}
          placeholder={t("account.phonePlaceholder")}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      <Input
        label={t("account.email")}
        id="profile-email"
        name="email"
        type="email"
        value={email}
        readOnly
        hint={t("account.emailHint")}
        className="bg-neutral-100 text-text-secondary"
      />

      <div aria-live="polite" className="flex flex-col gap-2">
        {statusMessage ? <p className="text-sm text-text-secondary">{statusMessage}</p> : null}
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger-700">
            {error}
          </p>
        ) : null}
        {saved && !error ? (
          <p className="text-sm font-medium text-success-800">{t("account.saved")}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={loading} className="w-fit rounded-full px-6">
        {loading ? t("account.saving") : t("account.save")}
      </Button>
    </form>
  );
}
