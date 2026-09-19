"use client";

import { HomeForm } from "@/components/home-form";

export function NewHomeForm({ circleId }: { circleId: string }) {
  return <HomeForm mode="create" circleId={circleId} />;
}
