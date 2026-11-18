import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export type ConvertedPage = {
  url: string;
  title: string;
  author: string;
  site: string;
  markdown: string;
  length: number;
};

export type ConvertError = "invalid" | "fetch" | "empty";

export type ConvertResult =
  | { ok: true; page: ConvertedPage }
  | { ok: false; error: ConvertError };

const FETCH_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml",
};

function parseWebUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
}

/** Fetches a public web page and extracts its main content as Markdown with defuddle. */
export async function convertUrl(
  input: string,
  fetcher: typeof fetch = fetch,
): Promise<ConvertResult> {
  const url = parseWebUrl(input);
  if (!url) return { ok: false, error: "invalid" };

  let html: string;
  try {
    const response = await fetcher(url.href, { headers: FETCH_HEADERS, redirect: "follow" });
    if (!response.ok) return { ok: false, error: "fetch" };
    html = await response.text();
  } catch {
    return { ok: false, error: "fetch" };
  }

  const { document } = parseHTML(html);
  const result = await Defuddle(document, url.href, { markdown: true });
  const markdown = (result.content ?? "").trim();
  if (!markdown) return { ok: false, error: "empty" };

  const author = result.author?.trim() ?? "";
  // defuddle falls back to the author when a page has no site name; the spec shows the domain instead.
  const site = result.site?.trim();
  return {
    ok: true,
    page: {
      url: url.href,
      title: result.title?.trim() || url.hostname,
      author,
      site: site && site !== author ? site : url.hostname.replace(/^www\./, ""),
      markdown,
      length: markdown.length,
    },
  };
}
