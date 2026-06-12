export const VENDOR_TYPES = ["FNB", "PASS", "TICKET", "SALE", "INVENTORY", "TABLES", "ACCESSX"];

export const DEFAULT_VENDOR_FORM = {
  vendorName: "",
  type: "INVENTORY",
  revShare: "",
  gstin: "",
  pan: "",
  serviceCharge: "",
  serviceChargeTax: "",
  showPrintDetails: false,
  dashboardPassword: "1234",
  mobile: "",
  address: "",
  thankYouNote: "Thank You for using AtomX POS",
  sac: false,
  sacText: "",
  autoPrint: false,
  maxInvoices: "",
  kot: false,
  kotCount: "",
  invoiceFormat: "format1",
  reprintPassword: "2026"
};

export function numericOnly(value) {
  return String(value ?? "").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

function hasValue(value) {
  return String(value ?? "").trim() !== "";
}

function numberValue(value) {
  const normalized = numericOnly(value);
  return normalized === "" ? undefined : Number(normalized);
}

export function buildVendorPayload(form, eventId) {
  const payload = {
    type: String(form.type || "INVENTORY").toLowerCase(),
    password: hasValue(form.dashboardPassword) ? form.dashboardPassword.trim() : "1234",
    rePrintPassword: hasValue(form.reprintPassword)
      ? Number(form.reprintPassword)
      : 2026,
    thankyouNote: hasValue(form.thankYouNote)
      ? form.thankYouNote.trim()
      : "Thank You for using AtomX POS",
    address: hasValue(form.address) ? form.address.trim() : " ",
    eventId: Number(eventId) || eventId
  };

  if (hasValue(form.vendorName)) payload.name = form.vendorName.trim();
  if (hasValue(form.revShare)) payload.revShare = numberValue(form.revShare);
  if (hasValue(form.gstin)) payload.gstin = form.gstin.trim();
  if (hasValue(form.pan)) payload.pan = form.pan.trim();
  if (hasValue(form.serviceCharge)) payload.sc = numberValue(form.serviceCharge);
  if (hasValue(form.serviceChargeTax)) payload.scTax = numberValue(form.serviceChargeTax);
  if (hasValue(form.mobile)) payload.mobile = form.mobile.trim();

  if (form.sac) {
    payload.showSac = 1;
    if (hasValue(form.sacText)) payload.sac = form.sacText.trim();
  }
  if (form.autoPrint) payload.autoPrint = 1;
  if (form.kot) {
    payload.kotPrint = 1;
    if (hasValue(form.kotCount)) payload.kotPrintCount = numberValue(form.kotCount);
  }
  if (hasValue(form.maxInvoices)) payload.invoicePrintCount = numberValue(form.maxInvoices);
  if (form.showPrintDetails && form.invoiceFormat) payload.printFormat = form.invoiceFormat;

  return payload;
}
