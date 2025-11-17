import { pingHealth } from "../../../lib/content";

export async function GET() {
  const status = await pingHealth();
  return Response.json({
    project: "livelink",
    ...status
  });
}
