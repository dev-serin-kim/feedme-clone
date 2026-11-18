// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { convertUrl } from "./convert-url";

const ARTICLE_HTML = `<!doctype html>
<html lang="ko">
<head>
  <title>파일은 앱보다 오래 남는다 | 하늘의 노트</title>
  <meta property="og:title" content="파일은 앱보다 오래 남는다">
  <meta property="og:site_name" content="하늘의 노트">
  <meta name="author" content="김하늘">
</head>
<body>
  <nav><a href="/">홈</a> <a href="/about">소개</a></nav>
  <article>
    <h1>파일은 앱보다 오래 남는다</h1>
    <p>기록을 오래 남기고 싶다면 <strong>내가 통제할 수 있는 파일</strong>로 남겨야 합니다. 이 글은 도구를 고를 때 제가 쓰는 기준을 정리한 것입니다.</p>
    <h2>앱은 사라지고 파일은 남는다</h2>
    <p>10년 전에 쓰던 메모 앱을 떠올려 보세요. 그중 지금도 서비스 중인 것은 몇 개나 될까요? 저는 세 번 이사를 했고, 그때마다 내보내기 버튼을 찾아 헤맸습니다.</p>
    <ul><li>평문으로 열리는가</li><li>폴더째 옮길 수 있는가</li></ul>
  </article>
  <footer>© 하늘의 노트</footer>
</body>
</html>`;

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

describe("convertUrl", () => {
  it.each(["example", "ftp://example.com/file", "javascript:alert(1)", "https://", ""])(
    "http/https 웹 주소가 아니면(%s) 페이지를 가져오지 않고 invalid 오류를 돌려준다",
    async (input) => {
      const fetcher = vi.fn();
      const result = await convertUrl(input, fetcher);
      expect(result).toEqual({ ok: false, error: "invalid" });
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it("네트워크 오류로 페이지를 가져오지 못하면 fetch 오류를 돌려준다", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    expect(await convertUrl("https://haneul.blog/post", fetcher)).toEqual({
      ok: false,
      error: "fetch",
    });
  });

  it("응답이 2xx가 아니면 fetch 오류를 돌려준다", async () => {
    const fetcher = vi.fn().mockResolvedValue(htmlResponse("<h1>Not Found</h1>", 404));
    expect(await convertUrl("https://haneul.blog/missing", fetcher)).toEqual({
      ok: false,
      error: "fetch",
    });
  });

  it("페이지는 열렸지만 추출된 본문이 비어 있으면 empty 오류를 돌려준다", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(htmlResponse("<html><head><title>앱</title></head><body><div id=root></div></body></html>"));
    expect(await convertUrl("https://app.example.com/", fetcher)).toEqual({
      ok: false,
      error: "empty",
    });
  });

  it("본문을 Markdown으로 뽑고 제목·저자·사이트명·URL·글자 수를 돌려준다", async () => {
    const fetcher = vi.fn().mockResolvedValue(htmlResponse(ARTICLE_HTML));
    const result = await convertUrl("  https://haneul.blog/files-outlive-apps  ", fetcher);

    expect(fetcher).toHaveBeenCalledWith("https://haneul.blog/files-outlive-apps", expect.anything());
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    const { page } = result;
    expect(page.url).toBe("https://haneul.blog/files-outlive-apps");
    expect(page.title).toBe("파일은 앱보다 오래 남는다");
    expect(page.author).toBe("김하늘");
    expect(page.site).toBe("하늘의 노트");
    expect(page.markdown).toContain("**내가 통제할 수 있는 파일**");
    expect(page.markdown).toContain("## 앱은 사라지고 파일은 남는다");
    expect(page.markdown).toMatch(/^- 평문으로 열리는가$/m);
    expect(page.markdown).not.toContain("소개");
    expect(page.length).toBe(page.markdown.length);
  });

  it("사이트명이 없으면 도메인을 사이트명으로 쓴다", async () => {
    const html = ARTICLE_HTML.replace('<meta property="og:site_name" content="하늘의 노트">', "").replace(
      "<footer>© 하늘의 노트</footer>",
      "",
    ).replace(" | 하늘의 노트", "");
    const fetcher = vi.fn().mockResolvedValue(htmlResponse(html));
    const result = await convertUrl("https://www.haneul.blog/files-outlive-apps", fetcher);
    if (!result.ok) throw new Error(`expected ok, got ${result.error}`);
    expect(result.page.site).toBe("haneul.blog");
  });
});
