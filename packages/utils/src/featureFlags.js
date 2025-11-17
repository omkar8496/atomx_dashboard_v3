const cache = new Map();

export function setFeatureFlag(flag, value) {
  cache.set(flag, value);
}

export function getFeatureFlag(flag, fallback = false) {
  return cache.has(flag) ? cache.get(flag) : fallback;
}

export function getAllFeatureFlags() {
  return Object.fromEntries(cache.entries());
}
