export function getEnvironment() {
  return {
    node: process.version,
    mode: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  };
}
