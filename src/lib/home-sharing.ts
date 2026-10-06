import { DEMO_CIRCLE_ID } from "@/lib/demo";

/** Sharing changes a relationship; it never changes home ownership or content. */
export function canChangeHomeSharing(input: {
  userId: string;
  ownerId: string | null;
  circleId: string;
  isMember: boolean;
  share: boolean;
}): boolean {
  if (!input.ownerId || input.ownerId !== input.userId) return false;
  // Owners may withdraw a home even after they have left its circle.
  if (!input.share) return true;
  return input.circleId !== DEMO_CIRCLE_ID && input.isMember;
}
