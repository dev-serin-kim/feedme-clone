import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Shown instead of sign-in screens when the deployment has no Supabase settings. */
export function AuthUnavailable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">지금은 로그인을 쓸 수 없어요</CardTitle>
        <CardDescription>로그인 설정이 아직 준비되지 않았어요. 웹 페이지 변환은 로그인 없이 그대로 쓸 수 있어요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/" className="font-bold underline underline-offset-4">
          변환 화면으로 가기
        </Link>
      </CardContent>
    </Card>
  );
}
