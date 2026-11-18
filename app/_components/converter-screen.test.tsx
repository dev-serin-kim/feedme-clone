import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConverterScreen } from "./converter-screen";

describe("ConverterScreen", () => {
  it("초기 결과가 없으면 URL 입력창과 빈 상태 안내를 보여준다", () => {
    render(<ConverterScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "웹 페이지를 Markdown으로" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "웹 페이지 URL" })).toHaveValue("");
    expect(screen.getByRole("button", { name: "변환하기" })).toBeInTheDocument();
    expect(screen.getByText("변환한 본문이 여기에 표시됩니다.")).toBeInTheDocument();
  });

  it("서버에서 변환한 초기 결과가 있으면 빈 상태 대신 그 결과와 주소를 보여준다", () => {
    render(
      <ConverterScreen
        initial={{
          url: "https://ko.wikipedia.org/wiki/%EB%A7%88%ED%81%AC%EB%8B%A4%EC%9A%B4",
          title: "마크다운 - 위키백과, 우리 모두의 백과사전",
          author: "",
          site: "ko.wikipedia.org",
          markdown: "**마크다운**은 가벼운 마크업 언어입니다.",
          length: 24,
        }}
      />,
    );

    expect(screen.getByRole("textbox", { name: "웹 페이지 URL" })).toHaveValue("https://ko.wikipedia.org/wiki/마크다운");
    expect(screen.getByRole("heading", { level: 2, name: "마크다운 - 위키백과, 우리 모두의 백과사전" })).toBeInTheDocument();
    expect(screen.getByText("마크다운", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ChatGPT로 열기" })).toBeInTheDocument();
    expect(screen.queryByText("변환한 본문이 여기에 표시됩니다.")).not.toBeInTheDocument();
  });
});
