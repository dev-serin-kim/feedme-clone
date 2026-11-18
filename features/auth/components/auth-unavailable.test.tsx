import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase 환경 변수가 없을 때 화면", () => {
  it("헤더의 로그인 링크는 오류 없이 아무것도 그리지 않는다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.resetModules();
    const { AuthLink } = await import("@/features/auth");

    const { container } = render(<AuthLink />);

    expect(container).toBeEmptyDOMElement();
  });

  it("로그인 폼 대신 지금은 로그인을 쓸 수 없다는 안내를 보여 준다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.resetModules();
    const { LoginForm } = await import("@/features/auth");

    render(<LoginForm />);

    expect(screen.getByText("지금은 로그인을 쓸 수 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "로그인" })).not.toBeInTheDocument();
  });

  it("회원가입 폼 대신 같은 안내를 보여 준다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.resetModules();
    const { SignUpForm } = await import("@/features/auth");

    render(<SignUpForm />);

    expect(screen.getByText("지금은 로그인을 쓸 수 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "회원가입" })).not.toBeInTheDocument();
  });
});
