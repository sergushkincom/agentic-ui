import { registryItem } from "@/lib/registry-item";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  const slug = name.endsWith(".json") ? name.slice(0, -".json".length) : name;
  const item = registryItem(slug);
  if (!item) return Response.json({ error: "Unknown registry item." }, { status: 404 });
  return Response.json(item);
}
