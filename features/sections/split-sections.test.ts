import { describe, expect, it } from "vitest";

import { joinSections, splitSections } from "./split-sections";

const ARTICLE = `마크다운은 가벼운 마크업 언어입니다.

## 역사

2004년에 만들어졌습니다.

### 세부 역사

CommonMark가 표준화를 시도했습니다.

## 문법

\`\`\`md
## 코드 안의 제목은 섹션이 아니다
\`\`\`

- 목록`;

describe("splitSections", () => {
  it("가장 얕은 제목 단계로 나누고, 첫 제목 앞의 글은 도입부 섹션이 된다", () => {
    const sections = splitSections(ARTICLE);
    expect(sections.map((s) => [s.title, s.isIntro])).toEqual([
      ["도입부", true],
      ["역사", false],
      ["문법", false],
    ]);
    expect(sections[1].body).toContain("### 세부 역사");
    expect(sections[1].heading).toBe("## 역사");
  });

  it("코드 블록 안의 # 줄은 제목으로 보지 않는다", () => {
    const sections = splitSections(ARTICLE);
    expect(sections).toHaveLength(3);
    expect(sections[2].body).toContain("## 코드 안의 제목은 섹션이 아니다");
  });

  it("### 가 가장 얕은 제목이면 그 단계로 나눈다", () => {
    const sections = splitSections("### 하나\n\n가\n\n### 둘\n\n나");
    expect(sections.map((s) => s.title)).toEqual(["하나", "둘"]);
  });

  it("제목이 없는 글은 도입부 하나뿐이다", () => {
    const sections = splitSections("그냥 문단입니다.\n\n또 문단.");
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ title: "도입부", isIntro: true });
  });

  it("섹션마다 서로 다른 id를 가진다", () => {
    const ids = splitSections(ARTICLE).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("joinSections", () => {
  it("선택한 섹션만 원래 순서와 제목 줄을 유지해 이어 붙인다", () => {
    const sections = splitSections(ARTICLE);
    const joined = joinSections(sections, new Set([sections[0].id, sections[2].id]));
    expect(joined).toBe("마크다운은 가벼운 마크업 언어입니다.\n\n## 문법\n\n```md\n## 코드 안의 제목은 섹션이 아니다\n```\n\n- 목록");
  });

  it("모두 선택하면 원래 Markdown과 같다", () => {
    const sections = splitSections(ARTICLE);
    expect(joinSections(sections, new Set(sections.map((s) => s.id)))).toBe(ARTICLE);
  });

  it("아무것도 선택하지 않으면 빈 문자열이다", () => {
    expect(joinSections(splitSections(ARTICLE), new Set())).toBe("");
  });
});
