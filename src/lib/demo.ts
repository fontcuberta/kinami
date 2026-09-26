/** Fixed IDs from supabase/migrations/007_demo_tour_signatures.sql */
export const DEMO_CIRCLE_ID = "a0000000-0000-4000-8000-000000000001";
export const DEMO_HOST_ID = "a0000000-0000-4000-8000-000000000000";

export const DEMO_HOME_BCN_ID = "a0000000-0000-4000-8000-000000000010";
export const DEMO_HOME_GIRONA_ID = "a0000000-0000-4000-8000-000000000011";

/** Bundled sample photos served from /public/demo */
export const DEMO_HOME_PHOTOS: Record<string, string[]> = {
  [DEMO_HOME_BCN_ID]: ["/demo/barcelona-living.jpg", "/demo/barcelona-bedroom.jpg"],
  [DEMO_HOME_GIRONA_ID]: ["/demo/girona-exterior.jpg", "/demo/girona-garden.jpg"],
};

export function isDemoCircle(circleId: string) {
  return circleId === DEMO_CIRCLE_ID;
}

export function photosForHome(homeId: string, photos: string[] | null | undefined) {
  if (photos && photos.length > 0) return photos;
  return DEMO_HOME_PHOTOS[homeId] ?? [];
}
