import Nav from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main
        id="main-content"
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 md:pb-8"
      >
        {children}
      </main>
    </>
  );
}
