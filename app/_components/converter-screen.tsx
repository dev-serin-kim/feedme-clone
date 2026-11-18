"use client";

import { CircleAlertIcon, FileTextIcon, LinkIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConvertedPage, ConvertResult } from "@/features/convert";

import { EXAMPLES } from "./examples";
import { ResultCard, type Failure } from "./result-card";

type ScreenState =
  | { status: "idle" }
  | { status: "invalid"; rows: number[] }
  | { status: "loading" }
  | { status: "error"; error: "fetch" | "empty" }
  | { status: "result"; id: number; pages: ConvertedPage[]; failures: Failure[] };

const MAX_URLS = 5;
const WEB_URL = /^https?:\/\/[^\s/?#]+\.[^\s/?#]+/i;

const ERRORS = {
  fetch: {
    title: "페이지를 가져오지 못했어요",
    description: "주소가 맞는지, 로그인 없이 열리는 공개 페이지인지 확인한 뒤 다시 시도해 주세요.",
  },
  empty: {
    title: "본문을 찾지 못했어요",
    description: "페이지는 열렸지만 추출할 글이 없었습니다. 화면을 스크립트로 그리는 페이지나 목록 페이지에서는 그럴 수 있어요.",
  },
} as const;

async function requestConvert(url: string): Promise<ConvertResult> {
  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return await response.json();
  } catch {
    return { ok: false, error: "fetch" };
  }
}

/** `initial` is a page converted on the server so the first visit opens on a result instead of the empty state. */
export function ConverterScreen({ initial }: { initial?: ConvertedPage }) {
  const [urls, setUrls] = useState<string[]>([initial?.url ? decodeURI(initial.url) : ""]);
  const [state, setState] = useState<ScreenState>(
    initial ? { status: "result", id: 0, pages: [initial], failures: [] } : { status: "idle" },
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLInputElement | null)[]>([]);
  /** Row the cursor was in last; example links fill this row. */
  const lastRow = useRef<number | null>(null);
  const requestId = useRef(0);

  function setUrlAt(index: number, value: string) {
    setUrls((current) => current.map((url, i) => (i === index ? value : url)));
    if (state.status === "invalid") setState({ status: "idle" });
  }

  async function convert() {
    const targets = urls.map((url, row) => ({ url: url.trim(), row })).filter((target) => target.url);
    const invalidRows = targets.length ? targets.filter((t) => !WEB_URL.test(t.url)).map((t) => t.row) : [0];
    if (invalidRows.length) {
      setState({ status: "invalid", rows: invalidRows });
      inputRef.current?.focus();
      return;
    }
    const id = ++requestId.current;
    setState({ status: "loading" });
    const results = await Promise.all(targets.map((target) => requestConvert(target.url)));
    if (id !== requestId.current) return; // cleared or superseded meanwhile

    const pages: ConvertedPage[] = [];
    const failures: Failure[] = [];
    results.forEach((result, index) => {
      if (result.ok) pages.push(result.page);
      else failures.push({ url: targets[index].url, error: result.error === "empty" ? "empty" : "fetch" });
    });
    if (pages.length) setState({ status: "result", id, pages, failures });
    else setState({ status: "error", error: failures.every((f) => f.error === "empty") ? "empty" : "fetch" });
  }

  function clear() {
    requestId.current++;
    setUrls([""]);
    lastRow.current = null;
    setState({ status: "idle" });
    inputRef.current?.focus();
  }

  const invalidRows = state.status === "invalid" ? state.rows : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12">
      <header className="flex items-center justify-between border-b-4 border-[#ffcc00] [border-bottom-style:ridge] bg-[#0000cc] px-3 py-2 text-[#ffff00]">
        <span className="inline-flex items-center gap-2 font-[family-name:var(--font-wordart)] text-xl [text-shadow:2px_2px_0_#ff00ff]">
          <span className="inline-grid size-6 place-items-center rounded-full border-2 border-[#ffff00] [border-style:outset] bg-[#ffff00] font-mono text-xs text-[#ff00ff] [text-shadow:none]">
            md
          </span>
          feedme
        </span>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="wordart text-3xl sm:text-4xl">웹 페이지를 Markdown으로</h1>
        <p>
          <span className="ppt-note">URL을 붙여넣으면 본문만 깔끔하게 뽑아 LLM에 바로 넘길 수 있게 해 드려요.</span>
        </p>
        <form
          noValidate
          className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start"
          onSubmit={(event) => {
            event.preventDefault();
            convert();
          }}
        >
          <div className="flex flex-1 flex-col gap-2">
            {urls.map((url, index) => (
              <div key={index} className="relative flex items-center">
                <LinkIcon className="pointer-events-none absolute left-3 size-4 text-[#0066cc]" />
                <Input
                  ref={(element) => {
                    rowRefs.current[index] = element;
                    if (index === 0) inputRef.current = element;
                  }}
                  onFocus={() => (lastRow.current = index)}
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://example.com/article"
                  aria-label={index === 0 ? "웹 페이지 URL" : `웹 페이지 URL ${index + 1}`}
                  aria-invalid={invalidRows.includes(index)}
                  aria-describedby={invalidRows.includes(index) ? "url-error" : undefined}
                  value={url}
                  onChange={(event) => setUrlAt(index, event.target.value)}
                  className="pr-10 pl-9"
                />
                {index === 0 && url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="지우기"
                    title="지우기"
                    onClick={clear}
                    className="absolute right-1 text-[#0066cc]"
                  >
                    <XIcon />
                  </Button>
                )}
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`URL ${index + 1} 빼기`}
                    title="이 칸 빼기"
                    onClick={() => {
                      setUrls((current) => current.filter((_, i) => i !== index));
                      lastRow.current = null;
                      if (state.status === "invalid") setState({ status: "idle" });
                    }}
                    className="absolute right-1 text-[#0066cc]"
                  >
                    <XIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="submit" disabled={state.status === "loading"}>
            변환하기
          </Button>
        </form>
        {state.status === "invalid" && (
          <p id="url-error" className="self-start border-2 border-destructive bg-white px-1.5 py-0.5 text-sm font-bold text-destructive">
            http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.
          </p>
        )}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={urls.length >= MAX_URLS}
            onClick={() => setUrls((current) => [...current, ""])}
          >
            <PlusIcon data-icon="inline-start" />
            URL 추가 ({urls.length}/{MAX_URLS})
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-black dark:text-[#ffff66]">
          <span>예시:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                const focused = lastRow.current;
                const empty = urls.findIndex((url) => !url.trim());
                const row = focused !== null && focused < urls.length ? focused : Math.max(empty, 0);
                setUrlAt(row, example);
                rowRefs.current[row]?.focus();
              }}
              className="break-all text-left text-[#0000ee] underline underline-offset-2 hover:text-[#ff00ff] dark:text-[#66ccff]"
            >
              {decodeURI(example).replace(/^https:\/\//, "")}
            </button>
          ))}
        </div>
      </section>

      {(state.status === "idle" || state.status === "invalid") && (
        <div className="flex flex-col items-center gap-3 border-3 border-dashed border-[#ff00ff] bg-white px-4 py-10 text-center font-bold text-black">
          <FileTextIcon className="size-6" />
          <p>변환한 본문이 여기에 표시됩니다.</p>
        </div>
      )}

      {state.status === "loading" && (
        <Card aria-busy="true" className="gap-0 py-0">
          <div className="flex flex-col gap-2 bg-(image:--header-panel) p-6 text-black">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Loader2Icon className="size-4 animate-spin" />
              페이지를 가져와 본문을 추출하는 중…
            </p>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex flex-col gap-2.5 p-6">
            <Skeleton className="h-3.5" />
            <Skeleton className="h-3.5" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="mt-3 h-3.5" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </Card>
      )}

      {state.status === "error" && (
        <Alert variant="destructive" role="alert">
          <CircleAlertIcon />
          <AlertTitle>{ERRORS[state.error].title}</AlertTitle>
          <AlertDescription>{ERRORS[state.error].description}</AlertDescription>
        </Alert>
      )}

      {state.status === "result" && <ResultCard key={state.id} pages={state.pages} failures={state.failures} />}
    </main>
  );
}
