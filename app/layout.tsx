import type { Metadata } from "next";
import Script from "next/script";

import { THEME_SCRIPT } from "@/components/theme-script";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "feedme - 웹 페이지를 Markdown으로",
  description: "URL을 붙여넣으면 본문만 Markdown으로 뽑아 ChatGPT·Claude에 바로 넘길 수 있습니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <Script id="theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
        <Toaster position="bottom-right" offset={{ bottom: 120 }} mobileOffset={{ bottom: 120 }} />
      </body>
    </html>
  );
}
