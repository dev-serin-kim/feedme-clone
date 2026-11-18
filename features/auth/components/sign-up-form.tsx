"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfig } from "@/lib/supabase/config";

import { AuthUnavailable } from "./auth-unavailable";

/**
 * Email/password sign-up, adapted from the Supabase UI "Password-based Auth" block.
 * Email confirmation is off for this project, so sign-up returns a session right away.
 */
export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!supabaseConfig()) return <AuthUnavailable />;

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    if (password !== repeatPassword) {
      setError("비밀번호가 서로 달라요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const { error } = await createClient().auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    router.push("/settings");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">회원가입</CardTitle>
        <CardDescription>이메일과 비밀번호로 새 계정을 만드세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repeat-password">비밀번호 확인</Label>
            <Input id="repeat-password" type="password" autoComplete="new-password" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "가입하는 중…" : "회원가입"}
          </Button>
          <p className="text-center text-sm">
            이미 계정이 있나요?{" "}
            <Link href="/auth/login" className="font-bold underline underline-offset-4">
              로그인
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
