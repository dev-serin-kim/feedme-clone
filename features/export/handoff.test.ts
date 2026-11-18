import { describe, expect, it } from "vitest";

import { buildBundle, buildDocument, buildHandoff, bundleFilename, markdownFilename } from "./handoff";

const page = {
  title: "파일은 앱보다 오래 남는다",
  url: "https://haneul.blog/files-outlive-apps",
  markdown: "기록을 오래 남기고 싶다면 파일로 남겨야 합니다.",
};

describe("buildDocument", () => {
  it("제목, 출처, 본문 순서의 Markdown 문서를 만든다", () => {
    expect(buildDocument(page)).toBe(
      "# 파일은 앱보다 오래 남는다\n\n출처: https://haneul.blog/files-outlive-apps\n\n기록을 오래 남기고 싶다면 파일로 남겨야 합니다.",
    );
  });
});

describe("buildHandoff", () => {
  const document = "# 제목\n\n출처: https://a.com\n\n본문";

  it("프롬프트가 있으면 프롬프트, 빈 줄, 문서 순서로 넘긴다", () => {
    expect(buildHandoff({ service: "Claude", prompt: "요약해줘", document }).text).toBe(
      "요약해줘\n\n# 제목\n\n출처: https://a.com\n\n본문",
    );
  });

  it("프롬프트가 비어 있거나 공백뿐이면 문서만 넘긴다", () => {
    expect(buildHandoff({ service: "Claude", prompt: "", document }).text).toBe(document);
    expect(buildHandoff({ service: "Claude", prompt: "   ", document }).text).toBe(document);
  });

  it("6,000자 이하면 ChatGPT 새 채팅 URL의 q에 내용을 채운다", () => {
    const handoff = buildHandoff({ service: "ChatGPT", prompt: "쉽게 설명해줘", document });
    expect(handoff.mode).toBe("prefill");
    const url = new URL(handoff.url);
    expect(url.origin + url.pathname).toBe("https://chatgpt.com/");
    expect(url.searchParams.get("q")).toBe("쉽게 설명해줘\n\n# 제목\n\n출처: https://a.com\n\n본문");
  });

  it("6,000자 이하면 Claude 새 채팅 URL의 q에 내용을 채운다", () => {
    const handoff = buildHandoff({ service: "Claude", prompt: "", document });
    expect(handoff.mode).toBe("prefill");
    const url = new URL(handoff.url);
    expect(url.origin + url.pathname).toBe("https://claude.ai/new");
    expect(url.searchParams.get("q")).toBe(document);
  });

  it("정확히 6,000자는 URL로 채우고 6,001자부터는 클립보드 방식으로 빈 새 채팅을 연다", () => {
    const exact = buildHandoff({ service: "ChatGPT", prompt: "", document: "가".repeat(6000) });
    expect(exact.mode).toBe("prefill");

    const over = buildHandoff({ service: "ChatGPT", prompt: "", document: "가".repeat(6001) });
    expect(over).toEqual({ mode: "clipboard", url: "https://chatgpt.com/", text: "가".repeat(6001) });

    const overClaude = buildHandoff({ service: "Claude", prompt: "요약해줘", document: "가".repeat(5995) });
    expect(overClaude.mode).toBe("clipboard");
    expect(overClaude.url).toBe("https://claude.ai/new");
    expect(overClaude.text.startsWith("요약해줘\n\n")).toBe(true);
  });
});

describe("markdownFilename", () => {
  it("제목 뒤에 .md를 붙인다", () => {
    expect(markdownFilename("파일은 앱보다 오래 남는다")).toBe("파일은 앱보다 오래 남는다.md");
  });

  it("파일 이름에 쓸 수 없는 문자를 뺀다", () => {
    expect(markdownFilename('React v19: "새 기능" <요약>/정리?*|\\')).toBe("React v19 새 기능 요약정리.md");
  });

  it("쓸 수 있는 글자가 없으면 기본 이름을 쓴다", () => {
    expect(markdownFilename(' ?*: ')).toBe("document.md");
  });
});

describe("buildBundle", () => {
  const a = { title: "글 A", url: "https://a.com/1", markdown: "본문 A" };
  const b = { title: "글 B", url: "https://b.com/2", markdown: "본문 B" };

  it("글이 하나면 기존 문서 형식과 같다", () => {
    expect(buildBundle([a])).toBe("# 글 A\n\n출처: https://a.com/1\n\n본문 A");
  });

  it("글이 여럿이면 글마다 문서를 만들어 --- 구분선으로 잇는다", () => {
    expect(buildBundle([a, b])).toBe(
      "# 글 A\n\n출처: https://a.com/1\n\n본문 A\n\n---\n\n# 글 B\n\n출처: https://b.com/2\n\n본문 B",
    );
  });
});

describe("bundleFilename", () => {
  it("글이 하나면 제목.md, 여럿이면 첫 제목 외 N개.md", () => {
    const a = { title: "글: A", url: "https://a.com", markdown: "" };
    const b = { title: "글 B", url: "https://b.com", markdown: "" };
    expect(bundleFilename([a])).toBe("글 A.md");
    expect(bundleFilename([a, b, b])).toBe("글 A 외 2개.md");
  });
});
