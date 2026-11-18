"use client";

import { CheckIcon, ChevronUpIcon, CopyIcon, DownloadIcon, ExternalLinkIcon, PresentationIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { buildDocument, buildHandoff, markdownFilename, type LlmService } from "../handoff";
import { renderSlideshowHtml } from "../slideshow";
import { buildSlides, type SlidePage } from "../slides";
import { SlideshowOverlay } from "./slideshow-overlay";

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"] as const;
const CUSTOM = "custom";

/**
 * Sticky export bar under the converted page. The page carries only its selected sections:
 * `markdown` for documents, `sections` for slides. Remount (change `key`) to reset the one-shot prompt.
 */
export function ExportBar({ page }: { page: SlidePage }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slidesHtml, setSlidesHtml] = useState<string | null>(null);

  const choice = selected[0];
  const prompt = choice === CUSTOM ? custom.trim() : (choice ?? "");
  const promptLabel = prompt || (choice === CUSTOM ? "직접 입력" : "없음");
  const document = buildDocument(page);
  const empty = !page.markdown.trim();

  async function copy() {
    await navigator.clipboard.writeText(document);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    toast("Markdown을 클립보드에 복사했어요");
  }

  function download() {
    const name = markdownFilename(page.title);
    const href = URL.createObjectURL(new Blob([document], { type: "text/markdown;charset=utf-8" }));
    const link = Object.assign(window.document.createElement("a"), { href, download: name });
    link.click();
    URL.revokeObjectURL(href);
    toast("다운로드를 시작했어요", { description: name });
  }

  async function openIn(service: LlmService) {
    const handoff = buildHandoff({ service, prompt, document });
    if (handoff.mode === "clipboard") {
      await navigator.clipboard.writeText(handoff.text);
      window.open(handoff.url, "_blank", "noopener,noreferrer");
      toast("본문이 길어서 클립보드에 복사했어요", {
        description: `새 탭의 ${service} 입력창에 붙여넣어(Ctrl+V) 주세요.${prompt ? ` “${prompt}” 프롬프트도 맨 앞에 함께 들어 있어요.` : ""}`,
      });
      return;
    }
    window.open(handoff.url, "_blank", "noopener,noreferrer");
    toast(`${service}를 새 탭에서 열었어요`, {
      description: prompt ? `“${prompt}” 프롬프트와 본문을 채워 두었어요.` : "본문을 채워 두었어요.",
    });
  }

  const closeSlides = useCallback(() => setSlidesHtml(null), []);

  function openSlides() {
    const filename = markdownFilename(page.title).replace(/\.md$/, ".html");
    setSlidesHtml(renderSlideshowHtml(buildSlides(page), page.title, filename));
  }

  return (
    <>
    {slidesHtml && <SlideshowOverlay html={slidesHtml} onClose={closeSlides} />}
    <div className="sticky bottom-0 z-10 flex flex-col gap-2.5 border-t-4 border-[#ff00ff] [border-top-style:ridge] bg-(image:--bar-background) px-4 py-3">
      {open && (
        <div id="prompt-panel" className="flex flex-col gap-2">
          <ToggleGroup
            aria-label="앞에 붙일 프롬프트"
            value={selected}
            onValueChange={(values) => setSelected(values as string[])}
            className="flex-wrap"
          >
            {PRESETS.map((preset) => (
              <ToggleGroupItem key={preset} value={preset} size="sm">
                {preset}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem value={CUSTOM} size="sm">
              직접 입력
            </ToggleGroupItem>
          </ToggleGroup>
          {choice === CUSTOM && (
            <Input
              autoFocus
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder="예: 핵심 주장 세 가지와 반론을 정리해줘"
              aria-label="직접 입력한 프롬프트"
            />
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          aria-expanded={open}
          aria-controls="prompt-panel"
          onClick={() => setOpen((value) => !value)}
          className="max-w-full gap-1 px-2 text-black underline hover:bg-transparent dark:text-[#ffff00]"
        >
          프롬프트: <b className="max-w-[12em] truncate">{promptLabel}</b>
          <ChevronUpIcon className={open ? "rotate-180" : undefined} />
        </Button>
        <span className="hidden flex-1 sm:block" />
        <Button variant="outline" size="icon" aria-label="복사하기" title="복사하기" disabled={empty} onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
        <Button variant="outline" size="icon" aria-label=".md 다운로드" title=".md 다운로드" disabled={empty} onClick={download}>
          <DownloadIcon />
        </Button>
        <Button variant="outline" disabled={empty} onClick={openSlides}>
          <PresentationIcon data-icon="inline-start" />
          PPT로 보기
        </Button>
        <div className="flex w-full gap-2 sm:w-auto">
          {(["ChatGPT", "Claude"] as const).map((service) => (
            <Button key={service} className="flex-1 sm:flex-none" disabled={empty} onClick={() => openIn(service)}>
              <ExternalLinkIcon data-icon="inline-start" />
              {service}로 열기
            </Button>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
