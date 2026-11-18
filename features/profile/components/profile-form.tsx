"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/** Edits the signed-in user's display name. RLS limits the update to their own row. */
export function ProfileForm({ userId, displayName }: { userId: string; displayName: string }) {
  const [value, setValue] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const { data, error } = await createClient()
      .from("profiles")
      .update({ display_name: value.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("display_name")
      .single();
    setSaving(false);
    if (error || !data) {
      setError("저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      return;
    }
    setValue(data.display_name ?? "");
    toast("표시 이름을 저장했어요");
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <div className="grid gap-2">
        <Label htmlFor="display-name">표시 이름</Label>
        <Input id="display-name" maxLength={50} placeholder="예: 김하늘" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
      <Button type="submit" disabled={saving} className="self-start">
        {saving ? "저장하는 중…" : "저장"}
      </Button>
    </form>
  );
}
