import type { Metadata } from "next";

import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "로그인 - feedme" };

export default function LoginPage() {
  return <LoginForm />;
}
