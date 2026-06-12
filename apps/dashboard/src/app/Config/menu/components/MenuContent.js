"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import MenuActionBar from "./MenuActionBar";
import CategoryTabs from "./CategoryTabs";
import CategoryDetailPanel from "./CategoryDetailPanel";
import MenuItemsTable from "./MenuItemsTable";

const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: "Cat",
    count: 4,
    active: true,
    vat: 0,
    gst: 0,
    gstInclusive: true,
    items: [
      {
        id: 1,
        name: "item1",
        price: 1,
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
      },
      {
        id: 2,
        name: "item2",
        price: 120,
        happy: 0,
        hsn: "",
        barcode: "",
        epc: "",
        type: "BEVERAGE",
        tags: ["VEG"],
        active: true,
        image: null,
        supplierCode: "",
        groupId: "",
        variant: "",
        colour: ""
      },
      {
        id: 3,
        name: "item3",
        price: 80,
        happy: 60,
        hsn: "",
        barcode: "",
        epc: "",
        type: "FOOD",
        tags: [],
        active: false,
        image: null,
        supplierCode: "",
        groupId: "",
        variant: "",
        colour: ""
      },
      {
        id: 4,
        name: "item4",
        price: 250,
        happy: 0,
        hsn: "1234",
        barcode: "",
        epc: "",
        type: "COMBO",
        tags: ["SPICY"],
        active: true,
        image: null,
        supplierCode: "",
        groupId: "",
        variant: "",
        colour: ""
      }
    ]
  },
  {
    id: 2,
    name: "cat",
    count: 2,
    active: true,
    vat: 0,
    gst: 5,
    gstInclusive: false,
    items: [
      {
        id: 5,
        name: "water bottle",
        price: 20,
        happy: 0,
        hsn: "",
        barcode: "",
        epc: "",
        type: "BEVERAGE",
        tags: ["VEG"],
        active: true,
        image: null,
        supplierCode: "",
        groupId: "",
        variant: "",
        colour: ""
      },
      {
        id: 6,
        name: "energy drink",
        price: 150,
        happy: 100,
        hsn: "",
        barcode: "",
        epc: "",
        type: "BEVERAGE",
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
];

export default function MenuContent({ stallName = "Stall1" }) {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [activeCategoryId, setActiveCategoryId] = useState(INITIAL_CATEGORIES[0]?.id);
  const [inactiveCategories, setInactiveCategories] = useState(true);
  const [inactiveItems, setInactiveItems] = useState(true);

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

      <div className="overflow-hidden rounded-lg border border-[#ded4ff] border-l-[3px] border-l-[#E04420] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
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
          onAddItem={addItem}
          inactiveItems={inactiveItems}
          onToggleInactiveItems={() => setInactiveItems((p) => !p)}
        />
      </div>
    </div>
  );
}
