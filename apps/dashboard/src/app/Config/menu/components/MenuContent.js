"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { fetchStallItems, saveStallMenu } from "../../../../lib/dashboardApi";
import { useDashboardStore } from "../../../../store/dashboardStore";
import MenuActionBar from "./MenuActionBar";
import CategoryTabs from "./CategoryTabs";
import CategoryDetailPanel from "./CategoryDetailPanel";
import MenuItemsTable from "./MenuItemsTable";
import { parseMenuFile, mergeImportedRows } from "./menuImport";
import SampleItemsPopup, { useSampleItems } from "./SampleItemsPopup";

function asNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asText(value) {
  return value == null ? "" : String(value).trim();
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => asText(tag).toUpperCase()).filter(Boolean);
  }

  return asText(value)
    .split(/[;,]/)
    .map((tag) => tag.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeMenuItem(item, index) {
  return {
    id: item?.id ?? `item-${index}`,
    // The row's real id on the server, so saving updates it instead of
    // inserting a copy. Null for rows added or imported in the browser, whose
    // `id` above is only a local key.
    serverId: item?.id ?? null,
    // Everything the API returned, replayed on save so fields this page has no
    // control over (itemCode, description, bottle/portion, expiry...) survive.
    raw: item ?? null,
    name: asText(item?.name),
    price: asNumber(item?.price),
    happy: asNumber(item?.happyPrice),
    hsn: asText(item?.hsn),
    barcode: asText(item?.barcode),
    epc: asText(item?.epc),
    type: asText(item?.type).toUpperCase() || "OTHER",
    tags: normalizeTags(item?.tags),
    active: asText(item?.status).toLowerCase() === "active",
    image: item?.imagePath ?? null,
    supplierCode: asText(item?.supplierCode),
    groupId: asText(item?.groupId),
    variant: asText(item?.variant),
    colour: asText(item?.colour),
    position: asNumber(item?.position, index),
    // Set by linking a row to an item from a Generic-Items stall.
    genericItemId: item?.genericItemId ?? null,
    // No UI controls for these; kept so saving echoes them back unchanged.
    mrp: asNumber(item?.mrp),
    quantity: asNumber(item?.quantity)
  };
}

function getResponseArray(response, key) {
  const candidates = [
    response?.[key],
    response?.data?.[key],
    response?.result?.[key],
    response?.data?.data?.[key]
  ];

  return candidates.find(Array.isArray) ?? [];
}

function normalizeMenuResponse(response) {
  const categories = getResponseArray(response, "categories");
  const allItems = getResponseArray(response, "items");
  const nestedMenu = getResponseArray(response, "menu");
  const menu = categories.length > 0 ? categories : nestedMenu;

  if (menu.length === 0) return [];

  const itemsByCategory = allItems.reduce((groupedItems, item) => {
    if (item?.categoryId == null) return groupedItems;

    const categoryKey = String(item.categoryId);
    const categoryItems = groupedItems.get(categoryKey) ?? [];
    categoryItems.push(item);
    groupedItems.set(categoryKey, categoryItems);
    return groupedItems;
  }, new Map());

  return menu.map((category, index) => {
    const categoryItems = Array.isArray(category?.items)
      ? category.items
      : itemsByCategory.get(String(category?.id)) ?? [];
    const items = categoryItems.map(normalizeMenuItem);

    const { items: _rawItems, ...rawCategory } = category ?? {};

    return {
      id: category?.id ?? `category-${index}`,
      serverId: category?.id ?? null,
      raw: category == null ? null : rawCategory,
      name: asText(category?.name) || `Category ${index + 1}`,
      // Required by the save payload but not editable in the UI.
      type: asText(category?.type),
      count: items.length,
      active: asText(category?.status).toLowerCase() === "active",
      vat: asNumber(category?.vat),
      gst: asNumber(category?.gstSlab),
      gstInclusive: asText(category?.gstType).toLowerCase() === "inclusive",
      items
    };
  });
}

function toStatus(active) {
  return active ? "active" : "inactive";
}

// Fields the server owns and we must not echo back.
function serverBase(raw) {
  const { id: _id, categoryId: _categoryId, createdAt: _createdAt, updatedAt: _updatedAt, items: _items, ...rest } =
    raw ?? {};
  return rest;
}

function itemPayload(item, index, categoryServerId) {
  return {
    ...serverBase(item.raw),
    // Present only for rows that already exist server-side; a new row is
    // inserted when it is absent.
    ...(item.serverId == null ? {} : { id: item.serverId }),
    // Taken from the category being saved rather than from the row's own
    // response, so it cannot point at a category the row no longer sits in.
    ...(categoryServerId == null ? {} : { categoryId: categoryServerId }),
    name: item.name,
    price: asNumber(item.price),
    mrp: asNumber(item.mrp),
    quantity: asNumber(item.quantity),
    status: toStatus(item.active),
    happyPrice: asNumber(item.happy),
    hsn: item.hsn || "",
    barcode: item.barcode || "",
    epc: item.epc || "",
    type: item.type || "",
    tags: item.tags ?? [],
    imagePath: item.image ?? null,
    supplierCode: item.supplierCode || "",
    groupId: item.groupId || "",
    variant: item.variant || "",
    colour: item.colour || "",
    position: asNumber(item.position, index + 1),
    genericItemId: item.genericItemId ?? null
  };
}

function categoryFields(category) {
  return {
    ...serverBase(category.raw),
    ...(category.serverId == null ? {} : { id: category.serverId }),
    name: category.name,
    type: category.type || "",
    status: toStatus(category.active),
    vat: asNumber(category.vat),
    gstSlab: asNumber(category.gst),
    gstType: category.gstInclusive ? "inclusive" : "exclusive"
  };
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

// The endpoint upserts by name, so only edited categories are sent, each
// carrying only its edited (or new) items. Untouched rows are left alone.
function buildMenuPayload(categories, baseline) {
  const baseById = new Map(baseline.map((category) => [String(category.id), category]));

  return categories.reduce((changed, category) => {
    const previous = baseById.get(String(category.id));
    const baseItems = new Map(
      (previous?.items ?? []).map((item) => [String(item.id), item])
    );

    const items = category.items
      .map((item, index) => ({
        payload: itemPayload(item, index, category.serverId),
        item,
        index
      }))
      .filter(({ payload, item }) => {
        const previousItem = baseItems.get(String(item.id));
        if (!previousItem) return true; // new item
        const previousIndex = (previous?.items ?? []).indexOf(previousItem);
        return !sameJson(
          payload,
          itemPayload(previousItem, previousIndex, category.serverId)
        );
      })
      .map(({ payload }) => payload);

    const categoryChanged =
      !previous || !sameJson(categoryFields(category), categoryFields(previous));

    if (!categoryChanged && items.length === 0) return changed;

    changed.push({ ...categoryFields(category), items });
    return changed;
  }, []);
}

export default function MenuContent() {
  // Set by the Config page before it navigates here; never read from the URL.
  const menuStall = useDashboardStore((state) => state.menuStall);
  const stallId = menuStall?.id ?? null;
  const stallName = menuStall?.name || "Stall";
  const token = useDashboardStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [inactiveCategories, setInactiveCategories] = useState(true);
  const [inactiveItems, setInactiveItems] = useState(true);
  const [loading, setLoading] = useState(Boolean(stallId));
  const [loadError, setLoadError] = useState("");
  // Snapshot of the menu as loaded, used to send only what changed.
  const [baseline, setBaseline] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  // Bumped after a save so the menu is re-read and newly created rows pick up
  // the ids the server just assigned them.
  const [reloadCount, setReloadCount] = useState(0);
  const [sampleOpen, setSampleOpen] = useState(false);
  // One catalogue for the whole page: the first Sample click loads it, later
  // clicks reuse it, and only the popup's Refresh re-fetches.
  const eventMetaId = useDashboardStore((state) => state.eventMeta?.eventId);
  const eventDetailsId = useDashboardStore((state) => state.eventDetails?.id);
  const eventId = eventMetaId ?? eventDetailsId;
  const sampleCatalogue = useSampleItems({ eventId, token });
  const { load: loadSampleItems } = sampleCatalogue;

  // The row whose "+ Sample" button opened the popup; the Link button writes
  // the chosen generic item's id onto it.
  const [sampleTargetId, setSampleTargetId] = useState(null);

  // Names for linked generic items, so a row can show what it points at. Only
  // known once the catalogue has been opened at least once; until then the row
  // falls back to the id rather than fetching on its own.
  const genericItemNames = useMemo(() => {
    const names = new Map();
    for (const row of sampleCatalogue.items) {
      if (row.id != null) {
        names.set(String(row.id), row.variant ? `${row.name} (${row.variant})` : row.name);
      }
    }
    return names;
  }, [sampleCatalogue.items]);

  // Anything the save would actually send counts as an unsaved change, so the
  // Save button uses the same diff the payload does.
  const hasUnsavedChanges = useMemo(
    () => buildMenuPayload(categories, baseline).length > 0,
    [categories, baseline]
  );

  const openSampleItems = useCallback(
    (itemId) => {
      setSampleTargetId(itemId);
      setSampleOpen(true);
      loadSampleItems();
    },
    [loadSampleItems]
  );

  useEffect(() => {
    let active = true;

    if (!stallId) {
      setCategories([]);
      setActiveCategoryId(null);
      setLoading(false);
      setLoadError("No stall is selected. Open a stall from the Configuration page.");
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setLoadError("");
    fetchStallItems({ stallId, token, dedupe: false })
      .then((response) => {
        if (!active) return;
        const nextCategories = normalizeMenuResponse(response);
        setCategories(nextCategories);
        setBaseline(nextCategories);
        setActiveCategoryId((current) =>
          nextCategories.some((category) => category.id === current)
            ? current
            : nextCategories[0]?.id ?? null
        );
      })
      .catch((error) => {
        if (!active) return;
        console.error(`Unable to load menu for stall ${stallId}`, error);
        setCategories([]);
        setActiveCategoryId(null);
        setLoadError("Unable to load this stall menu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [stallId, token, reloadCount]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;

  // What a linked row shows: the generic item's name while the link is still
  // unsaved, and the stored "GENERIC #id" once it has been saved.
  const genericItemLabels = useMemo(() => {
    const labels = new Map();
    const savedCategory = baseline.find((c) => c.id === activeCategoryId);
    const savedItems = new Map(
      (savedCategory?.items ?? []).map((item) => [String(item.id), item])
    );

    for (const item of activeCategory?.items ?? []) {
      if (item.genericItemId == null) continue;

      const saved = savedItems.get(String(item.id));
      const isSaved =
        saved != null && String(saved.genericItemId) === String(item.genericItemId);
      const name = genericItemNames.get(String(item.genericItemId));

      labels.set(
        item.id,
        isSaved || !name ? `GENERIC #${item.genericItemId}` : name
      );
    }
    return labels;
  }, [activeCategory, activeCategoryId, baseline, genericItemNames]);

  const updateCategory = (updates) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === activeCategoryId ? { ...c, ...updates } : c))
    );
  };

  const updateItem = (itemId, updates) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === activeCategoryId
          ? {
              ...c,
              items: c.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : c
      )
    );
  };

  const reorderItems = (sourceId, targetId, placement = "before") => {
    if (sourceId === targetId) return;

    setCategories((prev) =>
      prev.map((category) => {
        if (category.id !== activeCategoryId) return category;

        const sourceIndex = category.items.findIndex((item) => item.id === sourceId);
        const targetIndex = category.items.findIndex((item) => item.id === targetId);
        if (sourceIndex < 0 || targetIndex < 0) return category;

        const reorderedItems = [...category.items];
        const [movedItem] = reorderedItems.splice(sourceIndex, 1);
        let insertIndex = targetIndex + (placement === "after" ? 1 : 0);
        if (sourceIndex < insertIndex) insertIndex -= 1;
        reorderedItems.splice(insertIndex, 0, movedItem);

        return {
          ...category,
          items: reorderedItems.map((item, index) => ({
            ...item,
            position: index + 1
          }))
        };
      })
    );
  };

  const addCategory = () => {
    const newId = Date.now();
    const newName = `cat${categories.length + 1}`;
    const newItemId = newId + 1;
    setCategories((prev) => [
      ...prev,
      {
        id: newId,
        serverId: null,
        raw: null,
        name: newName,
        type: "",
        count: 1,
        active: true,
        vat: 0,
        gst: 0,
        gstInclusive: true,
        items: [
          {
            id: newItemId,
            serverId: null,
            raw: null,
            name: "",
            price: 0,
            happy: 0,
            hsn: "",
            barcode: "",
            epc: "",
            type: "FOOD",
            tags: [],
            active: true,
            image: null,
            supplierCode: "",
            groupId: "",
            variant: "",
            colour: "",
            genericItemId: null
          }
        ]
      }
    ]);
    setActiveCategoryId(newId);
  };

  const handleSave = async () => {
    if (!stallId) {
      setSaveMessage("");
      setSaveError("No stall is selected.");
      return;
    }

    // An unnamed row would be saved as a blank item, so stop before sending.
    const unnamed = categories.find((category) =>
      category.items.some((item) => !asText(item.name))
    );
    if (unnamed) {
      setSaveMessage("");
      setSaveError(`Every item in "${unnamed.name}" needs a name before saving.`);
      setActiveCategoryId(unnamed.id);
      return;
    }

    const changedCategories = buildMenuPayload(categories, baseline);
    if (changedCategories.length === 0) {
      setSaveError("");
      setSaveMessage("No changes to save.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveMessage("");
    try {
      const response = await saveStallMenu({
        stallId,
        categories: changedCategories,
        token
      });
      if (response?.success === false) {
        throw new Error(response?.message || "Unable to save this menu.");
      }
      setBaseline(categories);
      setSaveMessage("Menu saved.");
      // Re-read so rows created by this save stop looking new.
      setReloadCount((count) => count + 1);
    } catch (error) {
      console.error(`Unable to save menu for stall ${stallId}`, error);
      setSaveError(error?.message || "Unable to save this menu.");
    } finally {
      setSaving(false);
    }
  };

  const downloadExcel = () => {
    const header = [
      "CATEGORY", "CATEGORY STATUS", "ITEM", "COST", "MRP",
      "PRICE", "HAPPY PRICE", "BARCODE", "EPC", "QUANTITY",
      "ITEM CODE", "DESCRIPTION", "ITEM STATUS", "TAGS"
    ];
    const rows = [header];
    for (const cat of categories) {
      for (const item of cat.items) {
        rows.push([
          cat.name,
          cat.active ? "active" : "inactive",
          item.name,
          0,
          0,
          item.price,
          item.happy ?? 0,
          item.barcode ?? "",
          item.epc ?? "",
          0,
          item.supplierCode ?? "",
          "",
          item.active ? "active" : "inactive",
          (item.tags ?? []).join(",")
        ]);
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu");
    XLSX.writeFile(wb, `${stallName} Inventory.xlsx`);
  };

  // Loads a CSV/Excel menu straight into the table so it can be reviewed and
  // edited before Save sends it. Nothing is uploaded to the server here.
  const importMenuFile = async (file) => {
    if (!file) return;

    setSaveError("");
    setSaveMessage("");
    try {
      const { rows, truncated } = await parseMenuFile(file);
      const { categories: nextCategories, summary, focusCategoryId } =
        mergeImportedRows(categories, rows, {
          fileName: file.name,
          activeCategoryId
        });

      setCategories(nextCategories);
      if (focusCategoryId != null) setActiveCategoryId(focusCategoryId);

      const parts = [];
      if (summary.added) parts.push(`${summary.added} item(s) added`);
      if (summary.updated) parts.push(`${summary.updated} item(s) updated`);
      if (summary.createdCategories) {
        parts.push(`${summary.createdCategories} new category(s)`);
      }
      if (truncated) parts.push(`${truncated} name(s) trimmed to 16 characters`);
      setSaveMessage(`${file.name}: ${parts.join(", ")}. Review, then Save.`);
    } catch (error) {
      console.error(`Unable to import menu file ${file.name}`, error);
      setSaveError(error?.message || "Unable to read this file.");
    }
  };

  const addItem = () => {
    if (!activeCategoryId) return;
    const newId = Date.now();
    setCategories((prev) =>
      prev.map((c) =>
        c.id === activeCategoryId
          ? {
              ...c,
              count: c.count + 1,
              items: [
                ...c.items,
                {
                  id: newId,
                  serverId: null,
                  raw: null,
                  name: "",
                  price: 0,
                  happy: 0,
                  hsn: "",
                  barcode: "",
                  epc: "",
                  type: "FOOD",
                  tags: [],
                  active: true,
                  image: null,
                  supplierCode: "",
                  groupId: "",
                  variant: "",
                  colour: "",
                  genericItemId: null,
                  mrp: 0,
                  quantity: 0
                }
              ]
            }
          : c
      )
    );
  };

  const visibleItems = (activeCategory?.items ?? []).filter(
    (item) => inactiveItems || item.active
  );

  return (
    <div className="flex flex-col gap-4">
      <MenuActionBar
        stallName={stallName}
        inactiveCategories={inactiveCategories}
        onToggleInactiveCategories={() => setInactiveCategories((p) => !p)}
        onDownload={downloadExcel}
        onAddCategory={addCategory}
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {saveError ? (
        <p className="rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)] px-3.5 py-2.5 text-[12.5px] font-semibold text-(--orange)">
          {saveError}
        </p>
      ) : null}
      {saveMessage ? (
        <p className="rounded-[10px] border border-[rgba(0,169,242,0.28)] bg-[rgba(0,169,242,0.08)] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#0284c7]">
          {saveMessage}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) shadow-(--shadow)">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-[13px] font-medium text-(--muted)">
            Loading menu…
          </div>
        ) : loadError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="text-[13px] font-semibold text-(--orange)">{loadError}</p>
            {stallId ? null : (
              <Link
                href="/Config"
                className="flex h-9 items-center rounded-[8px] bg-(--text) px-3.5 text-[12.5px] font-semibold text-(--bg) transition hover:bg-(--orange)"
              >
                Go to Configuration
              </Link>
            )}
          </div>
        ) : (
          <>
        <CategoryTabs
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        <CategoryDetailPanel
          category={activeCategory}
          onUpdate={updateCategory}
        />

        <MenuItemsTable
          items={visibleItems}
          onItemUpdate={updateItem}
          onReorderItems={reorderItems}
          onAddItem={addItem}
          inactiveItems={inactiveItems}
          onToggleInactiveItems={() => setInactiveItems((p) => !p)}
          categoryName={activeCategory?.name}
          onImportMenu={importMenuFile}
          onOpenSampleItems={openSampleItems}
          genericItemLabels={genericItemLabels}
        />
          </>
        )}
      </div>

      <SampleItemsPopup
        open={sampleOpen}
        onClose={() => setSampleOpen(false)}
        catalogue={sampleCatalogue}
        linkedId={
          (activeCategory?.items ?? []).find((item) => item.id === sampleTargetId)
            ?.genericItemId ?? null
        }
        onLink={(row) => {
          if (sampleTargetId == null || row?.id == null) return;
          updateItem(sampleTargetId, { genericItemId: row.id });
          setSampleOpen(false);
        }}
      />
    </div>
  );
}
