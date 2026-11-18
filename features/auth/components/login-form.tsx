"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/client";

/** Email/password sign-in, adapted from the Supabase UI "Password-based Auth" block. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 맞지 않아요." : error.message);
      setIsLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(safeNextPath(next, "/settings"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호로 로그인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인하는 중…" : "로그인"}
          </Button>
          <p className="text-center text-sm">
            계정이 없나요?{" "}
            <Link href="/auth/sign-up" className="font-bold underline underline-offset-4">
              회원가입
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
