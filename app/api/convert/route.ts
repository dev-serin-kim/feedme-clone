import { convertUrl } from "@/features/convert";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const result = await convertUrl(typeof body?.url === "string" ? body.url : "");
  return Response.json(result);
}
