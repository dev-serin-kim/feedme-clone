export type LlmService = "ChatGPT" | "Claude";

export type DocumentSource = { title: string; url: string; markdown: string };

/** prefill: open a new chat with the text in `?q=`; clipboard: copy the text and open an empty new chat. */
export type Handoff = { mode: "prefill" | "clipboard"; url: string; text: string };

/** Interim limit until real ChatGPT/Claude `?q=` limits are measured (spec: 보류한 결정). */
export const PREFILL_LIMIT = 6000;

const NEW_CHAT_URL: Record<LlmService, string> = {
  ChatGPT: "https://chatgpt.com/",
  Claude: "https://claude.ai/new",
};

export function buildDocument({ title, url, markdown }: DocumentSource): string {
  return `# ${title}\n\n출처: ${url}\n\n${markdown}`;
}

export function buildHandoff({
  service,
  prompt,
  document,
}: {
  service: LlmService;
  prompt: string;
  document: string;
}): Handoff {
  const trimmed = prompt.trim();
  const text = trimmed ? `${trimmed}\n\n${document}` : document;
  const base = NEW_CHAT_URL[service];
  if (text.length > PREFILL_LIMIT) return { mode: "clipboard", url: base, text };

  // encodeURIComponent keeps spaces as %20; "+" would survive a plain decodeURIComponent on the other side.
  return { mode: "prefill", url: `${base}?q=${encodeURIComponent(text)}`, text };
}

export function markdownFilename(title: string): string {
  const name = title
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
  return `${name || "document"}.md`;
}
