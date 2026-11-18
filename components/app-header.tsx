import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { AuthLink } from "@/features/auth";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b-4 border-[#ffcc00] [border-bottom-style:ridge] bg-[#0000cc] px-3 py-2 text-[#ffff00]">
      <Link href="/" className="inline-flex items-center gap-2 font-[family-name:var(--font-wordart)] text-xl [text-shadow:2px_2px_0_#ff00ff]">
        <span className="inline-grid size-6 place-items-center rounded-full border-2 border-[#ffff00] [border-style:outset] bg-[#ffff00] font-mono text-xs text-[#ff00ff] [text-shadow:none]">
          md
        </span>
        feedme
      </Link>
      <div className="flex items-center gap-2">
        <AuthLink />
        <ThemeToggle />
      </div>
    </header>
  );
}
