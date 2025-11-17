export function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1
  }).format(value);
}

export function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}
