"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConvertedPage } from "@/features/convert";
import { ExportBar, type SlidePage } from "@/features/export";
import { joinSections, splitSections, type Section } from "@/features/sections";

export type Failure = { url: string; error: "fetch" | "empty" };

const FAILURE_REASON = { fetch: "가져오지 못함", empty: "본문 없음" } as const;

const shortUrl = (url: string) => decodeURI(url).replace(/^https?:\/\//, "");
const formatCount = (count: number) => `${count.toLocaleString("ko-KR")}자`;

/** Converted pages with per-section selection; every export uses only the selected sections. Remount to reset. */
export function ResultCard({ pages, failures }: { pages: ConvertedPage[]; failures: Failure[] }) {
  const sectioned = useMemo(() => pages.map((page) => ({ page, sections: splitSections(page.markdown) })), [pages]);
  const [unselected, setUnselected] = useState<ReadonlySet<string>>(new Set());

  const keyOf = (pageIndex: number, section: Section) => `${pageIndex}:${section.id}`;
  const isSelected = (pageIndex: number, section: Section) => !unselected.has(keyOf(pageIndex, section));
  function toggle(pageIndex: number, section: Section, checked: boolean) {
    setUnselected((current) => {
      const next = new Set(current);
      if (checked) next.delete(keyOf(pageIndex, section));
      else next.add(keyOf(pageIndex, section));
      return next;
    });
  }

  const exportPages: SlidePage[] = sectioned
    .map(({ page, sections }, pageIndex) => {
      const chosen = sections.filter((section) => isSelected(pageIndex, section));
      return {
        title: page.title,
        url: page.url,
        site: page.site,
        author: page.author,
        markdown: joinSections(chosen, new Set(chosen.map((section) => section.id))),
        sections: chosen.map((section) => ({ title: section.title, body: section.body })),
      };
    })
    .filter((page) => page.markdown.trim());

  const total = pages.reduce((sum, page) => sum + page.length, 0);
  const selectedCount = exportPages.reduce((sum, page) => sum + page.markdown.length, 0);
  const count = unselected.size ? `선택 ${formatCount(selectedCount)} / 전체 ${formatCount(total)}` : formatCount(total);
  const many = pages.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {failures.length > 0 && (
        <Alert variant="destructive" role="alert">
          <TriangleAlertIcon />
          <AlertTitle>
            {pages.length + failures.length}개 중 {failures.length}개를 가져오지 못했어요
          </AlertTitle>
          <AlertDescription>
            <ul>
              {failures.map((failure) => (
                <li key={failure.url} className="break-all">
                  {shortUrl(failure.url)} ({FAILURE_REASON[failure.error]})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card className="gap-0 overflow-visible py-0">
        <header className="flex flex-col gap-2 border-b-3 border-dotted border-[#ff00ff] bg-(image:--header-panel) px-4 py-5 text-black sm:px-6">
          {many ? (
            <>
              <p className="text-sm font-bold text-[#006600]">
                문서 {pages.length}개 · 총 {count}
              </p>
              <h2 className="font-[family-name:var(--font-wordart)] text-2xl leading-snug text-[#cc0000] underline decoration-[#0000ff] decoration-wavy underline-offset-[6px]">
                문서 {pages.length}개 모음
              </h2>
              <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm font-bold">
                {pages.map((page) => (
                  <li key={page.url}>
                    <span className="text-[#cc0000]">{page.title}</span>{" "}
                    <span className="text-[#006600]">
                      ({page.site} ·{" "}
                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
                        {shortUrl(page.url)}
                      </a>
                      )
                    </span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-[#006600]">
                <span>{pages[0].site}</span>
                <span aria-hidden>·</span>
                <a href={pages[0].url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
                  {shortUrl(pages[0].url)}
                </a>
                <span aria-hidden>·</span>
                <span>{count}</span>
              </p>
              <h2 className="font-[family-name:var(--font-wordart)] text-2xl leading-snug text-[#cc0000] underline decoration-[#0000ff] decoration-wavy underline-offset-[6px]">
                {pages[0].title}
              </h2>
              {pages[0].author && <p className="font-bold text-[#9900cc]">{pages[0].author}</p>}
            </>
          )}
        </header>

        <div className="markdown flex flex-col px-4 py-6 sm:px-6">
          {sectioned.map(({ page, sections }, pageIndex) => (
            <article key={page.url} className={many && pageIndex > 0 ? "mt-6 border-t-3 border-dotted border-[#ff00ff] pt-6" : undefined}>
              {many && (
                <p className="mb-3 text-sm font-bold text-[#006600]">
                  [{pageIndex + 1}] {page.title} · 출처: {shortUrl(page.url)}
                </p>
              )}
              {sections.map((section) => {
                const checked = isSelected(pageIndex, section);
                return (
                  <section key={section.id} data-selected={checked} className="mb-2">
                    <div className={`flex items-center gap-2 ${checked ? "" : "opacity-45"}`}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggle(pageIndex, section, value)}
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
            </article>
          ))}
        </div>

        <ExportBar pages={exportPages} />
      </Card>
    </div>
  );
}
