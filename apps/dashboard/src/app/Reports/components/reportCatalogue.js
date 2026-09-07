// Single source of truth for the report catalogue, shared by the Overview cards
// and the download form.
//
// `type`        - exact value the backend expects in the build payload
// `name`        - what the operator sees
// `description` - shown on the card and in the form
// `access`      - roles allowed to run it ("operators" = any operator role)
// `group`       - which Overview section it belongs to

export const OPERATOR_ACCESS = "operators";

export const REPORT_GROUPS = [
  { id: "summary", label: "Summary", hint: "Aggregated totals" },
  { id: "dumps", label: "Dumps", hint: "Row-level datasets" },
  { id: "analytics", label: "Analytics", hint: "Derived metrics" },
  { id: "other", label: "Other", hint: "Reference listings" }
];

export const REPORT_CATALOGUE = [
  { type: "summary", group: "summary", name: "ATOMX SUMMARY", description: "Overall event/vendor/stall summary report", access: ["admin", OPERATOR_ACCESS] },
  { type: "summary2", group: "summary", name: "ATOMX ITEM WISE TOTALS", description: "Item-wise redemption totals and summary", access: ["admin", OPERATOR_ACCESS] },
  { type: "summary_access", group: "summary", name: "ATOMX ACCESS SUMMARY", description: "Summary of access/check-in activity", access: ["admin", "access"] },

  { type: "dump_tx_detail", group: "dumps", name: "ATOMX DETAILED TRANSACTION DUMP", description: "Detailed transaction-level data dump", access: ["admin"] },
  { type: "dump_tx_basic", group: "dumps", name: "ATOMX BASIC TRANSACTION DUMP", description: "Basic transaction data dump with essential fields", access: ["admin"] },
  { type: "access_dump", group: "dumps", name: "ATOMX ACCESS DUMP", description: "Detailed access/check-in records", access: ["admin", "access"] },
  { type: "mobile_dump", group: "dumps", name: "ATOMX MOBILE DUMP", description: "Mobile-related data dump", access: ["admin"] },
  { type: "whitelist_dump", group: "dumps", name: "ATOMX WHITELIST DUMP", description: "Whitelist records and associated information", access: ["admin", OPERATOR_ACCESS] },
  { type: "consent_dump", group: "dumps", name: "ATOMX CONSENT DUMP", description: "Customer/user consent records", access: ["admin"] },
  { type: "perso_dump", group: "dumps", name: "ATOMX PERSO DUMP", description: "Personalization-related data dump", access: ["admin", OPERATOR_ACCESS] },
  { type: "tapx_dump", group: "dumps", name: "ATOMX TAPX DUMP", description: "TapX-related transaction/data dump", access: ["admin"] },
  { type: "mrg_redm_acs", group: "dumps", name: "ATOMX MERGED REDEMPTION ACCESS", description: "Combined redemption and access dataset", access: ["admin", OPERATOR_ACCESS] },

  { type: "redemption_analytics", group: "analytics", name: "ATOMX REDEMPTION ANALYTICS", description: "Redemption analytics and aggregated metrics", access: ["admin", OPERATOR_ACCESS] },
  { type: "inventory_analytics", group: "analytics", name: "ATOMX INVENTORY ANALYTICS", description: "Inventory consumption and analytics report", access: ["admin", "inventory"] },

  { type: "full_menu", group: "other", name: "ATOMX FULL MENU", description: "Complete menu/item listing", access: ["admin", OPERATOR_ACCESS] }
];

export function normalizeAccessRole(value) {
  return String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
}

// Admin runs everything. An operator runs the shared reports plus any report
// naming their own role. With no resolvable role we fall back to the shared set.
export function canAccessReport(report, role) {
  const normalized = normalizeAccessRole(role);
  if (!normalized) return report.access.includes(OPERATOR_ACCESS);
  if (normalized === "admin") return true;
  return report.access.includes(OPERATOR_ACCESS) || report.access.includes(normalized);
}

export function getAccessibleReports(role) {
  return REPORT_CATALOGUE.filter((report) => canAccessReport(report, role));
}

// Accessible reports bucketed into the Overview sections, empty groups dropped.
export function getReportSections(role) {
  const accessible = getAccessibleReports(role);
  return REPORT_GROUPS.map((group) => ({
    ...group,
    reports: accessible.filter((report) => report.group === group.id)
  })).filter((group) => group.reports.length > 0);
}

export function getReportByType(type) {
  return REPORT_CATALOGUE.find((report) => report.type === type) ?? null;
}
