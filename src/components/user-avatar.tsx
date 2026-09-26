"use client";

import { useState } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type UserAvatarProps = {
  userId: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
  /** Extra ring class for stacked avatars (e.g. border-white/70). */
  ringClassName?: string;
};

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 96,
};

const SIZE_TEXT: Record<AvatarSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-2xl",
};

/** Accessible Kinami brand pairs: background fills + high-contrast glyph. */
const PALETTES = [
  { bg: "#2955a6", fg: "#eef4fc", node: "#8fb4f5" },
  { bg: "#1e4483", fg: "#eaf1fd", node: "#b7cff9" },
  { bg: "#173b76", fg: "#dce8fb", node: "#8fb4f5" },
  { bg: "#25314f", fg: "#e8edf8", node: "#a9afc2" },
  { bg: "#286473", fg: "#e8f4f6", node: "#6a98a0" },
  { bg: "#3d4f78", fg: "#eef1f8", node: "#9aa8c9" },
] as const;

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function profileInitials(name: string | null | undefined, userId?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  if (userId) {
    const hex = userId.replace(/-/g, "").slice(0, 2);
    return hex.toUpperCase() || "?";
  }
  return "?";
}

export function avatarPalette(userId: string) {
  return PALETTES[hashId(userId) % PALETTES.length];
}

function OrbitMonogram({
  userId,
  fullName,
  size,
}: {
  userId: string;
  fullName?: string | null;
  size: number;
}) {
  const palette = avatarPalette(userId);
  const letters = profileInitials(fullName, userId);
  const fontSize = Math.round(size * 0.34);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className="h-full w-full"
    >
      <circle cx="32" cy="32" r="32" fill={palette.bg} />
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke={palette.node}
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="2.5 3.5"
      />
      <circle cx="32" cy="10" r="2.2" fill={palette.node} fillOpacity="0.9" />
      <circle cx="51" cy="32" r="2.2" fill={palette.node} fillOpacity="0.9" />
      <circle cx="32" cy="54" r="2.2" fill={palette.node} fillOpacity="0.9" />
      <circle cx="13" cy="32" r="2.2" fill={palette.node} fillOpacity="0.9" />
      <circle
        cx="32"
        cy="32"
        r="14"
        fill="none"
        stroke={palette.fg}
        strokeOpacity="0.18"
        strokeWidth="1.25"
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fill={palette.fg}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="Public Sans, ui-sans-serif, system-ui, sans-serif"
        letterSpacing="0.04em"
      >
        {letters}
      </text>
    </svg>
  );
}

export function UserAvatar({
  userId,
  fullName,
  avatarUrl,
  size = "md",
  className = "",
  ringClassName = "",
}: UserAvatarProps) {
  const [broken, setBroken] = useState(false);
  const px = SIZE_PX[size];
  const showPhoto = Boolean(avatarUrl) && !broken;
  const label = fullName?.trim() || undefined;

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${ringClassName} ${className}`}
      style={{ width: px, height: px }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl!}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <OrbitMonogram userId={userId} fullName={fullName} size={px} />
      )}
      {!showPhoto && !label ? (
        <span className={`sr-only ${SIZE_TEXT[size]}`}>{profileInitials(fullName, userId)}</span>
      ) : null}
    </span>
  );
}
