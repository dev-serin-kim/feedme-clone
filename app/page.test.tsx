import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 URL 입력창과 변환 버튼, 빈 상태 안내를 보여준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "웹 페이지를 Markdown으로" })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "웹 페이지 URL" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변환하기" })).toBeInTheDocument();
  expect(screen.getByText("변환한 본문이 여기에 표시됩니다.")).toBeInTheDocument();
});
