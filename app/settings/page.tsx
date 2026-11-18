import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth";
import { ProfileForm } from "@/features/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "설정 - feedme" };

export default async function SettingsPage() {
  const supabase = await createClient();
  // getClaims() verifies the JWT, so the page never trusts an unverified client session.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/auth/login?next=/settings");

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", claims.sub).single();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12">
      <AppHeader />
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">설정</CardTitle>
          <p className="text-sm font-bold text-[#006600]">{claims.email}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ProfileForm userId={claims.sub} displayName={profile?.display_name ?? ""} />
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
