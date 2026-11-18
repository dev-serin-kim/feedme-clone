// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

async function loadUpdateSession() {
  vi.resetModules();
  return (await import("./proxy")).updateSession;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("updateSession (Supabase 환경 변수가 없을 때)", () => {
  it("변환 화면 요청은 오류 없이 그대로 통과시킨다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const updateSession = await loadUpdateSession();

    const response = await updateSession(new NextRequest("http://localhost/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("보호된 /settings 요청은 로그인 화면으로 보낸다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const updateSession = await loadUpdateSession();

    const response = await updateSession(new NextRequest("http://localhost/settings"));

    expect(response.headers.get("location")).toBe("http://localhost/auth/login?next=%2Fsettings");
  });
});
