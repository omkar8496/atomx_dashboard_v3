export const STEP_ONE_STATE_KEY = "atomx.tag_series.step1";

export function saveStepOneState(state) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STEP_ONE_STATE_KEY, JSON.stringify(state));
}

export function getStepOneState() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STEP_ONE_STATE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse step one state", error);
    return null;
  }
}

export function clearStepOneState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STEP_ONE_STATE_KEY);
}
