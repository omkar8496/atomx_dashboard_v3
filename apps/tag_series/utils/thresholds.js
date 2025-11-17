export const energyThreshold = 40;

export function getHealthState(percentage) {
  if (percentage > 80) return "healthy";
  if (percentage > 50) return "observe";
  if (percentage > 20) return "warning";
  return "critical";
}
