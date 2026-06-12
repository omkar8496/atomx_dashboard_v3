const DEFAULT_PAY_OPTIONS = ["cash", "card", "coupon"];

function enabled(value) {
  return value ? 1 : 0;
}

function lower(value, fallback = "") {
  return String(value || fallback).trim().toLowerCase();
}

function hasValue(value) {
  return String(value ?? "").trim() !== "";
}

function normalizedId(value) {
  const text = String(value ?? "").trim();
  return /^\d+$/.test(text) ? Number(text) : value;
}

export function buildCreateStallPayload(form, vendorId) {
  const payOptions =
    form.acceptAllModes && Array.isArray(form.paymentModes) && form.paymentModes.length > 0
      ? form.paymentModes
      : DEFAULT_PAY_OPTIONS;

  const payload = {
    name: String(form.stallName || "").trim(),
    type: lower(form.type, "sale"),
    bankOption: "none",
    scanMode: lower(form.scanMode, "none"),
    smsFormat: "default",
    kotLan: enabled(form.kotLan),
    addDiscountInCard: 0,
    accessxSettings: {
      nfcSettings: lower(form.nfcSetting, "logic"),
      qrSettings: String(form.qrSetting || "OFF").trim().toUpperCase(),
      useOnlineTopups: enabled(form.useOnlineTopups),
      checkOnlineUnique: enabled(form.checkOnlineUnique),
      useFetchDetails: enabled(form.fetchDetails),
      useInOut: enabled(form.useInOutLogic),
    },
    payOptions: payOptions.map((option) => lower(option)).join(","),
    vendorId: normalizedId(vendorId),
    payOption: 0,
    useGrn: enabled(form.grnMode),
    cashDisabled: enabled(form.cashDisabled),
    modeInfoMandatory: enabled(form.modeInfoMandatory),
    showStall: enabled(form.showInTapX),
  };

  if (hasValue(form.locationId)) {
    payload.accessxSettings.locationId = String(form.locationId).trim();
  }

  if (hasValue(form.eventMatchId)) {
    payload.accessxSettings.eventMatchId = String(form.eventMatchId).trim();
  }

  return payload;
}
