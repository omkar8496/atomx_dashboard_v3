import * as XLSX from "xlsx";

// Item names are capped at 16 characters and are not editable from the table,
// so anything longer is trimmed on the way in rather than left unreachable.
const ITEM_NAME_LIMIT = 16;

// Accepted spellings for each column of the sample sheet. Headers are matched
// case- and space-insensitively, and a second pass drops any "(...)" hint so
// "Type(food/drink/ticket/other)" still lands on "type".
const COLUMN_ALIASES = {
  name: ["Item", "Item Name", "Name"],
  category: ["Category", "Category Name"],
  categoryStatus: ["Category Status"],
  price: ["Price"],
  mrp: ["MRP"],
  happy: ["Happy Price", "Happy"],
  hsn: ["HSN"],
  barcode: ["Barcode"],
  epc: ["Epc"],
  type: ["Type"],
  supplierCode: ["Supplier Code"],
  itemCode: ["Item Code"],
  groupId: ["Group Id"],
  variant: ["Variation", "Variant"],
  colour: ["Colour", "Color"],
  tags: ["Tags"],
  quantity: ["Quantity"],
  status: ["Item Status", "Status"]
};

function normalizeHeader(value) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, "");
}

function stripHint(value) {
  return normalizeHeader(value).replace(/\(.*?\)/g, "");
}

function asText(value) {
  return value == null ? "" : String(value).trim();
}

function asNumber(value, fallback = 0) {
  const numberValue = Number(asText(value));
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function splitTags(value) {
  return asText(value)
    .split(/[;,]/)
    .map((tag) => tag.trim().toUpperCase())
    .filter(Boolean);
}

// Maps each column index of the header row onto a field of our item model.
function mapHeaderRow(headerRow) {
  const exact = new Map();
  const loose = new Map();

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      if (!exact.has(normalizeHeader(alias))) exact.set(normalizeHeader(alias), field);
      if (!loose.has(stripHint(alias))) loose.set(stripHint(alias), field);
    }
  }

  const columns = new Map();
  headerRow.forEach((heading, index) => {
    const field = exact.get(normalizeHeader(heading)) ?? loose.get(stripHint(heading));
    if (field && !columns.has(field)) columns.set(field, index);
  });

  return columns;
}

function readCell(row, columns, field) {
  const index = columns.get(field);
  return index == null ? "" : asText(row[index]);
}

// Reads the first sheet of a CSV or Excel file into plain row objects.
export async function parseMenuFile(file) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("This file has no sheet to read.");

  const grid = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: ""
  });

  const headerIndex = grid.findIndex((row) =>
    row.some((cell) => asText(cell) !== "")
  );
  if (headerIndex < 0) throw new Error("This file is empty.");

  const columns = mapHeaderRow(grid[headerIndex]);
  if (!columns.has("name")) {
    throw new Error('No "Item" column found. Use the Sample file as a template.');
  }

  let truncated = 0;
  const rows = grid.slice(headerIndex + 1).reduce((parsed, row) => {
    const rawName = readCell(row, columns, "name");
    if (!rawName) return parsed;

    const name = rawName.slice(0, ITEM_NAME_LIMIT).trim();
    if (name !== rawName) truncated += 1;

    parsed.push({
      category: readCell(row, columns, "category"),
      categoryActive:
        readCell(row, columns, "categoryStatus").toLowerCase() !== "inactive",
      name,
      price: asNumber(readCell(row, columns, "price")),
      mrp: asNumber(readCell(row, columns, "mrp")),
      happy: asNumber(readCell(row, columns, "happy")),
      quantity: asNumber(readCell(row, columns, "quantity")),
      hsn: readCell(row, columns, "hsn"),
      barcode: readCell(row, columns, "barcode"),
      epc: readCell(row, columns, "epc"),
      type: readCell(row, columns, "type").toUpperCase() || "FOOD",
      tags: splitTags(readCell(row, columns, "tags")),
      supplierCode:
        readCell(row, columns, "supplierCode") ||
        readCell(row, columns, "itemCode"),
      groupId: readCell(row, columns, "groupId"),
      variant: readCell(row, columns, "variant"),
      colour: readCell(row, columns, "colour"),
      active: readCell(row, columns, "status").toLowerCase() !== "inactive"
    });
    return parsed;
  }, []);

  if (rows.length === 0) throw new Error("No item rows found in this file.");

  return { rows, truncated };
}

function newItem(row, id, position) {
  return {
    id,
    // Imported rows do not exist server-side yet; a matched row keeps the
    // serverId it already carries (see mergedItem).
    serverId: null,
    raw: null,
    name: row.name,
    price: row.price,
    happy: row.happy,
    hsn: row.hsn,
    barcode: row.barcode,
    epc: row.epc,
    type: row.type,
    tags: row.tags,
    active: row.active,
    image: null,
    supplierCode: row.supplierCode,
    groupId: row.groupId,
    variant: row.variant,
    colour: row.colour,
    position,
    mrp: row.mrp,
    quantity: row.quantity
  };
}

function mergedItem(existing, row) {
  return {
    ...existing,
    name: row.name,
    price: row.price,
    happy: row.happy,
    hsn: row.hsn,
    barcode: row.barcode,
    epc: row.epc,
    type: row.type,
    tags: row.tags,
    active: row.active,
    supplierCode: row.supplierCode,
    groupId: row.groupId,
    variant: row.variant,
    colour: row.colour,
    mrp: row.mrp,
    quantity: row.quantity
  };
}

function categoryNameFromFile(fileName) {
  return asText(fileName).replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function sameName(left, right) {
  return asText(left).toLowerCase() === asText(right).toLowerCase();
}

// Item names repeat across variants (one tee in five sizes), so a row is
// identified by its barcode, then its EPC, and only then by the name/variant
// pair. Matching on the name alone would fold every size into one row.
function hasCode(item) {
  return Boolean(asText(item?.barcode) || asText(item?.epc));
}

function weakKey(item) {
  const supplierCode = asText(item?.supplierCode).toLowerCase();
  const variant = asText(item?.variant).toLowerCase();
  if (supplierCode && variant) return `code:${supplierCode}|${variant}`;
  return `name:${asText(item?.name).toLowerCase()}|${variant}`;
}

function findExistingIndex(items, row) {
  const barcode = asText(row.barcode).toLowerCase();
  if (barcode) {
    const index = items.findIndex(
      (item) => asText(item.barcode).toLowerCase() === barcode
    );
    if (index >= 0) return index;
  }

  const epc = asText(row.epc).toLowerCase();
  if (epc) {
    const index = items.findIndex((item) => asText(item.epc).toLowerCase() === epc);
    if (index >= 0) return index;
  }

  // Fall back to the name/variant pair, but never onto an item that already
  // carries a barcode or EPC of its own - that one is a different row.
  const key = weakKey(row);
  return items.findIndex((item) => !hasCode(item) && weakKey(item) === key);
}

// Decides which category each row belongs to: an explicit Category column wins,
// then a category matching the file name, then whatever tab is open.
function targetCategoryName(row, { fileName, activeCategory, categories }) {
  if (row.category) return row.category;

  const fromFile = categoryNameFromFile(fileName);
  if (fromFile && categories.some((category) => sameName(category.name, fromFile))) {
    return fromFile;
  }
  if (activeCategory) return activeCategory.name;
  return fromFile || "Imported";
}

// Upserts the parsed rows into the menu by category name, then item name, so a
// re-upload updates the rows it matches instead of duplicating them.
export function mergeImportedRows(categories, rows, { fileName, activeCategoryId }) {
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? null;
  const next = categories.map((category) => ({
    ...category,
    items: [...category.items]
  }));

  let added = 0;
  let updated = 0;
  let createdCategories = 0;
  let idSeed = Date.now();
  let firstTouchedId = null;

  for (const row of rows) {
    const name = targetCategoryName(row, { fileName, activeCategory, categories: next });
    let category = next.find((candidate) => sameName(candidate.name, name));

    if (!category) {
      idSeed += 1;
      category = {
        id: `import-${idSeed}`,
        serverId: null,
        raw: null,
        name,
        type: "",
        count: 0,
        active: row.categoryActive,
        vat: 0,
        gst: 0,
        gstInclusive: true,
        items: []
      };
      next.push(category);
      createdCategories += 1;
    }

    if (firstTouchedId == null) firstTouchedId = category.id;

    const existingIndex = findExistingIndex(category.items, row);

    if (existingIndex >= 0) {
      category.items[existingIndex] = mergedItem(category.items[existingIndex], row);
      updated += 1;
    } else {
      idSeed += 1;
      category.items.push(newItem(row, `import-${idSeed}`, category.items.length + 1));
      added += 1;
    }
  }

  return {
    categories: next.map((category) => ({ ...category, count: category.items.length })),
    summary: { added, updated, createdCategories },
    focusCategoryId: firstTouchedId
  };
}
