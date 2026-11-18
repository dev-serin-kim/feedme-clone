import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // tsconfig.json의 "@/*" 경로 별칭을 Vite가 직접 해석한다.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
    // 헤더의 로그인 링크가 Supabase 클라이언트를 만든다. 세션이 없으면 네트워크 요청은 없다.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    },
    exclude: [
      "node_modules/**",
      ".next/**",
      "e2e/**",
      // 에이전트 스킬은 skills-lock.json이 관리하는 벤더 복사본이고,
      // .claude/worktrees는 이 앱의 중복 체크아웃이다.
      ".claude/**",
      ".agents/**",
    ],
  },
});
