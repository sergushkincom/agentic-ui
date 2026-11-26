import { registryIndex } from "@/lib/registry-index";

export const dynamic = "force-static";

export function GET() {
  return Response.json(registryIndex());
}
