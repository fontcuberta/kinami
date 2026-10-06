import Nav from "@/components/nav";
import { OnboardingTour } from "@/components/onboarding-tour";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let showTour = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle<{ onboarding_completed_at: string | null }>();
    showTour = !profile?.onboarding_completed_at;
  }

  return (
    <>
      <Nav />
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 lg:pb-8"
      >
        <OnboardingTour enabled={showTour} />
        {children}
      </main>
    </>
  );
}
