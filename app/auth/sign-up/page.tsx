import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth";

export const metadata: Metadata = { title: "회원가입 - feedme" };

export default function SignUpPage() {
  return <SignUpForm />;
}
