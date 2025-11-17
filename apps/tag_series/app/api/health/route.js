import { pingHealth } from "../../../lib/devices";

export async function GET() {
  const status = await pingHealth();
  return Response.json({
    project: "tag_series",
    ...status
  });
}
