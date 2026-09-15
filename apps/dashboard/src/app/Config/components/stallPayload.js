function lower(value, fallback = "") {
  return String(value || fallback).trim().toLowerCase();
}

function normalizedId(value) {
  const text = String(value ?? "").trim();
  return /^\d+$/.test(text) ? Number(text) : value;
}

// Stall creation currently takes only these three fields. The modal collects
// more (payment modes, scan mode, GRN, AccessX settings), but none of it is
// sent until the backend accepts it.
export function buildCreateStallPayload(form, vendorId) {
  return {
    name: String(form.stallName || "").trim(),
    vendorId: normalizedId(vendorId),
    type: lower(form.type, "sale")
  };
}
