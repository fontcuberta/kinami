import { redirect } from "next/navigation";
// Preserve old bookmarks while separating property creation from sharing.
export default async function LegacyCircleHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/circles/${id}?view=my-homes`);
}
