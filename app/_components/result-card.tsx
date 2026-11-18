"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConvertedPage } from "@/features/convert";
import { ExportBar, type SlidePage } from "@/features/export";
import { joinSections, splitSections } from "@/features/sections";

const formatCount = (count: number) => `${count.toLocaleString("ko-KR")}자`;

/** The converted page with per-section selection; every export uses only the selected sections. Remount to reset. */
export function ResultCard({ page }: { page: ConvertedPage }) {
  const sections = useMemo(() => splitSections(page.markdown), [page.markdown]);
  const [unselected, setUnselected] = useState<ReadonlySet<string>>(new Set());

  function toggle(id: string, checked: boolean) {
    setUnselected((current) => {
      const next = new Set(current);
      if (checked) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const chosen = sections.filter((section) => !unselected.has(section.id));
  const exportPage: SlidePage = {
    title: page.title,
    url: page.url,
    site: page.site,
    author: page.author,
    markdown: joinSections(chosen, new Set(chosen.map((section) => section.id))),
    sections: chosen.map((section) => ({ title: section.title, body: section.body })),
  };
  const count = unselected.size
    ? `선택 ${formatCount(exportPage.markdown.length)} / 전체 ${formatCount(page.length)}`
    : formatCount(page.length);

  return (
    <Card className="gap-0 overflow-visible py-0">
      <header className="flex flex-col gap-2 border-b-3 border-dotted border-[#ff00ff] bg-(image:--header-panel) px-4 py-5 text-black sm:px-6">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-[#006600]">
          <span>{page.site}</span>
          <span aria-hidden>·</span>
          <a href={page.url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
            {decodeURI(page.url).replace(/^https?:\/\//, "")}
          </a>
          <span aria-hidden>·</span>
          <span>{count}</span>
        </p>
        <h2 className="font-[family-name:var(--font-wordart)] text-2xl leading-snug text-[#cc0000] underline decoration-[#0000ff] decoration-wavy underline-offset-[6px]">
          {page.title}
        </h2>
        {page.author && <p className="font-bold text-[#9900cc]">{page.author}</p>}
      </header>

      <div className="markdown flex flex-col px-4 py-6 sm:px-6">
        {sections.map((section) => {
          const checked = !unselected.has(section.id);
          return (
            <section key={section.id} data-selected={checked} className="mb-2">
              <div className={`flex items-center gap-2 ${checked ? "" : "opacity-45"}`}>
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => toggle(section.id, value)}
                  aria-label={`${section.title} 섹션 담기`}
                  className="size-5 rounded-none border-2 border-black bg-white"
                />
                {section.isIntro ? (
                  <span className="text-sm font-bold text-[#0066cc]">도입부</span>
                ) : (
                  <div className="[&>*]:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.heading}</ReactMarkdown>
                  </div>
                )}
              </div>
              {checked && section.body && (
                <div className="mt-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <ExportBar page={exportPage} />
    </Card>
  );
}
