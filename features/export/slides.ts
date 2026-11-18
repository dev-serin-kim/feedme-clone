import type { DocumentSource } from "./handoff";

export type SlidePage = DocumentSource & {
  site: string;
  author: string;
  sections: { title: string; body: string }[];
};

export type Slide =
  | { kind: "cover"; title: string; subtitle: string }
  | { kind: "content"; title: string; body: string }
  | { kind: "end" };

/** Rough body size per slide before splitting into "(계속)" slides; the slide then shrinks text to fit. */
export const SLIDE_CHUNK = 700;

/** Paragraph blocks separated by blank lines, keeping fenced code blocks whole. */
function blocks(body: string): string[] {
  const result: string[] = [];
  let lines: string[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && !line.trim()) {
      if (lines.length) result.push(lines.join("\n"));
      lines = [];
    } else {
      lines.push(line);
    }
  }
  if (lines.length) result.push(lines.join("\n"));
  return result;
}

/** Splits a body at paragraph boundaries into chunks of about SLIDE_CHUNK characters. */
function chunk(body: string): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of blocks(body)) {
    if (current && current.length + paragraph.length > SLIDE_CHUNK) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }
  if (current || chunks.length === 0) chunks.push(current);
  return chunks;
}

export function buildSlides(page: SlidePage): Slide[] {
  const subtitle = [page.site, page.author].filter(Boolean).join(" · ");
  const slides: Slide[] = [{ kind: "cover", title: page.title, subtitle }];

  for (const section of page.sections) {
    // Footnote definitions render to nothing once split from their references, leaving blank slides.
    const body = section.body
      .split("\n")
      .filter((line) => !/^\s*\[\^[^\]]+\]:/.test(line))
      .join("\n")
      .replace(/\[\^[^\]]+\]/g, "")
      .trim();
    if (!body) continue;
    chunk(body).forEach((part, index) => {
      slides.push({ kind: "content", title: index ? `${section.title} (계속)` : section.title, body: part });
    });
  }
  slides.push({ kind: "end" });
  return slides;
}
