import { AppHeader } from "@/components/app-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12">
      <AppHeader />
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </main>
  );
}
