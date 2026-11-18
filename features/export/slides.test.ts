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
    const slides = buildSlides([page(1, [{ title: "도입부", body: "안녕" }, { title: "역사", body: "2004년" }])]);
    expect(slides).toEqual([
      { kind: "cover", title: "글 1", subtitle: "사이트 1 · 김하늘" },
      { kind: "content", title: "도입부", body: "안녕" },
      { kind: "content", title: "역사", body: "2004년" },
      { kind: "end" },
    ]);
  });

  it("글이 여럿이면 표지 제목은 문서 N개 모음이고 글마다 간지가 들어간다", () => {
    const slides = buildSlides([page(1, [{ title: "가", body: "a" }]), page(2, [{ title: "나", body: "b" }])]);
    expect(slides.map((s) => (s.kind === "end" ? "end" : `${s.kind}:${s.title}`))).toEqual([
      "cover:문서 2개 모음",
      "divider:글 1",
      "content:가",
      "divider:글 2",
      "content:나",
      "end",
    ]);
    expect(slides[0]).toMatchObject({ subtitle: "사이트 1 · 사이트 2" });
  });

  it("본문이 길면 문단 경계에서 나눠 (계속) 슬라이드로 이어 간다", () => {
    const para = "가".repeat(SLIDE_CHUNK - 100);
    const slides = buildSlides([page(2, [{ title: "긴 섹션", body: `${para}\n\n${para}\n\n${para}` }])]);
    const content = slides.filter((s) => s.kind === "content");
    expect(content.map((s) => s.kind === "content" && s.title)).toEqual(["긴 섹션", "긴 섹션 (계속)", "긴 섹션 (계속)"]);
    expect(content.every((s) => s.kind === "content" && s.body === para)).toBe(true);
  });

  it("문단 하나가 기준보다 길어도 자르지 않고 한 장에 둔다", () => {
    const huge = "나".repeat(SLIDE_CHUNK * 2);
    const slides = buildSlides([page(2, [{ title: "통짜", body: huge }])]);
    expect(slides.filter((s) => s.kind === "content")).toEqual([{ kind: "content", title: "통짜", body: huge }]);
  });
});
