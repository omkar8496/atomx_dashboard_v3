"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";
import { fetchStallItems } from "../../../../lib/dashboardApi";
import { useDashboardStore } from "../../../../store/dashboardStore";
import MenuActionBar from "./MenuActionBar";
import CategoryTabs from "./CategoryTabs";
import CategoryDetailPanel from "./CategoryDetailPanel";
import MenuItemsTable from "./MenuItemsTable";

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
    position: asNumber(item?.position, index)
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

    return {
      id: category?.id ?? `category-${index}`,
      name: asText(category?.name) || `Category ${index + 1}`,
      count: items.length,
      active: asText(category?.status).toLowerCase() === "active",
      vat: asNumber(category?.vat),
      gst: asNumber(category?.gstSlab),
      gstInclusive: asText(category?.gstType).toLowerCase() === "inclusive",
      items
    };
  });
}

export default function MenuContent() {
  const searchParams = useSearchParams();
  const stallId = searchParams.get("stallId");
  const stallName = searchParams.get("stallName") || "Stall";
  const token = useDashboardStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [inactiveCategories, setInactiveCategories] = useState(true);
  const [inactiveItems, setInactiveItems] = useState(true);
  const [loading, setLoading] = useState(Boolean(stallId));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    if (!stallId) {
      setCategories([]);
      setActiveCategoryId(null);
      setLoading(false);
      setLoadError("Stall ID is unavailable.");
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
        setActiveCategoryId(nextCategories[0]?.id ?? null);
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
  }, [stallId, token]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;

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
        name: newName,
        count: 1,
        active: true,
        vat: 0,
        gst: 0,
        gstInclusive: true,
        items: [
          {
            id: newItemId,
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
            colour: ""
          }
        ]
      }
    ]);
    setActiveCategoryId(newId);
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
                  colour: ""
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
      />

      <div className="overflow-hidden rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange) bg-(--surface) shadow-(--shadow)">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-[13px] font-medium text-(--muted)">
            Loading menu…
          </div>
        ) : loadError ? (
          <div className="flex min-h-[220px] items-center justify-center px-5 text-center text-[13px] font-semibold text-(--orange)">
            {loadError}
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
        />
          </>
        )}
      </div>
    </div>
  );
}
