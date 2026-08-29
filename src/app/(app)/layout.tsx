import Nav from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        {children}
      </main>
    </>
  );
}
