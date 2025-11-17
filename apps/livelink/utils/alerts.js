import { formatPercentage } from "@atomx/utils";

export function getLiveAlerts() {
  return [
    {
      message: "Realtime sentiment dropped",
      value: formatPercentage(12.4),
      severity: "warning"
    },
    {
      message: "2 streams pending review",
      value: "Moderation",
      severity: "info"
    }
  ];
}
