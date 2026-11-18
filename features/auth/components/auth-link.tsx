"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

/** Header link: "로그인" when signed out, "설정" when signed in. Display only; /settings checks on the server. */
export function AuthLink() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => setSignedIn(Boolean(data?.claims)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return null;
  return (
    <Link href={signedIn ? "/settings" : "/auth/login"} className="text-sm font-bold underline underline-offset-4">
      {signedIn ? "설정" : "로그인"}
    </Link>
  );
}
