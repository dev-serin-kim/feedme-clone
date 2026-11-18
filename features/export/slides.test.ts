import { describe, expect, it } from "vitest";

import { buildSlides, SLIDE_CHUNK } from "./slides";

const page = (n: number, sections: { title: string; body: string }[]) => ({
  title: `글 ${n}`,
  url: `https://site${n}.com/post`,
  markdown: "",
  site: `사이트 ${n}`,
  author: n === 1 ? "김하늘" : "",
  sections,
});

describe("buildSlides", () => {
  it("글 하나: 표지, 섹션마다 한 장, 마지막 감사 슬라이드", () => {
    const slides = buildSlides(page(1, [{ title: "도입부", body: "안녕" }, { title: "역사", body: "2004년" }]));
    expect(slides).toEqual([
      { kind: "cover", title: "글 1", subtitle: "사이트 1 · 김하늘" },
      { kind: "content", title: "도입부", body: "안녕" },
      { kind: "content", title: "역사", body: "2004년" },
      { kind: "end" },
    ]);
  });

  it("본문이 길면 문단 경계에서 나눠 (계속) 슬라이드로 이어 간다", () => {
    const para = "가".repeat(SLIDE_CHUNK - 100);
    const slides = buildSlides(page(2, [{ title: "긴 섹션", body: `${para}\n\n${para}\n\n${para}` }]));
    const content = slides.filter((s) => s.kind === "content");
    expect(content.map((s) => s.kind === "content" && s.title)).toEqual(["긴 섹션", "긴 섹션 (계속)", "긴 섹션 (계속)"]);
    expect(content.every((s) => s.kind === "content" && s.body === para)).toBe(true);
  });

  it("문단 하나가 기준보다 길어도 자르지 않고 한 장에 둔다", () => {
    const huge = "나".repeat(SLIDE_CHUNK * 2);
    const slides = buildSlides(page(2, [{ title: "통짜", body: huge }]));
    expect(slides.filter((s) => s.kind === "content")).toEqual([{ kind: "content", title: "통짜", body: huge }]);
  });
});

describe("buildSlides 코드 블록", () => {
  it("빈 줄이 있는 코드 블록은 슬라이드 경계에서 둘로 나뉘지 않는다", () => {
    const code = "```js\nconst a = 1;\n\nconst b = 2;\n```";
    const para = "가".repeat(SLIDE_CHUNK - 20);
    const slides = buildSlides(page(2, [{ title: "코드", body: `${para}\n\n${code}` }]));
    const bodies = slides.flatMap((s) => (s.kind === "content" ? [s.body] : []));
    expect(bodies).toEqual([para, code]);
  });
});

describe("buildSlides 각주", () => {
  it("각주 표시와 정의는 빼고, 내용이 없어진 슬라이드는 만들지 않는다", () => {
    const slides = buildSlides(
      page(2, [
        { title: "역사", body: "2004년에 나왔다.[^13]" },
        { title: "외부 링크", body: "[^1]: 그루버, 2004\n[^2]: CommonMark" },
      ]),
    );
    expect(slides.filter((s) => s.kind === "content")).toEqual([{ kind: "content", title: "역사", body: "2004년에 나왔다." }]);
  });
});
