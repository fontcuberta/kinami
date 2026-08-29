import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "@/components/nav-links";
import { Button } from "@/components/ui/button";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          href="/circles"
          className="font-display text-2xl font-semibold text-accent-700"
        >
          Kinami
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-6 text-base text-text-secondary">
          <NavLinks />
          {user && (
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="secondary" className="min-h-9 px-3 py-1.5 text-sm">
                Salir
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
