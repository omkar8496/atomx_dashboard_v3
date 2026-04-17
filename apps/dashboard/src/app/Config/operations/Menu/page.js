"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import ConfigTransition from "../../components/ConfigTransition";
import MenuActionBar from "./components/MenuActionBar";
import CategoryCard from "./components/CategoryCard";
import MenuItemsTable from "./components/MenuItemsTable";

const DEFAULT_ITEMS = [
  {
    id: "ITM-001",
    itemName: "Classic Veg Burger",
    price: "249",
    happy: "199",
    hsn: "210690",
    barcode: "890000120001",
    epc: "2600207001",
    type: "Food",
    tags: "Bestseller",
    status: "Veg",
    imageEnabled: true,
    supplierCode: "SUP-11",
    groupId: "GRP-A1",
    qty: "120",
    size: "M",
    color: "NA"
  },
  {
    id: "ITM-002",
    itemName: "Cold Coffee",
    price: "180",
    happy: "150",
    hsn: "220299",
    barcode: "890000120002",
    epc: "2600207002",
    type: "Beverage",
    tags: "Cafe",
    status: "Drink",
    imageEnabled: false,
    supplierCode: "SUP-21",
    groupId: "GRP-B2",
    qty: "80",
    size: "L",
    color: "Brown"
  }
];

export default function MenuPage() {
  const [inactiveCategory, setInactiveCategory] = useState(false);
  const [categoryEnabled, setCategoryEnabled] = useState(true);
  const [taxType, setTaxType] = useState("GST");
  const [taxPercent, setTaxPercent] = useState("18");
  const [taxMode, setTaxMode] = useState("inclusive");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DEFAULT_ITEMS;
    return DEFAULT_ITEMS.filter((item) =>
      [
        item.itemName,
        item.barcode,
        item.epc,
        item.supplierCode,
        item.groupId,
        item.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header
        areaLabel="Configuration"
        breadcrumb={
          <>
            <Link className="text-slate-600 hover:text-[#258d9c]" href="/Config/profile" replace>
              Profile
            </Link>
            <span className="text-slate-400">/</span>
            <Link className="font-semibold text-[#258d9c]" href="/Config/operations" replace>
              Operations
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-[#258d9c]">Menu</span>
          </>
        }
      />

      <ConfigTransition>
        <div className="mt-2 w-full pl-12 pr-3 md:pl-16 md:pr-6">
          <div className="space-y-4">
            <MenuActionBar
              inactiveCategory={inactiveCategory}
              onInactiveCategoryChange={setInactiveCategory}
            />

            <CategoryCard
              categoryName="Main Course"
              categoryEnabled={categoryEnabled}
              onCategoryEnabledChange={setCategoryEnabled}
              taxType={taxType}
              onTaxTypeChange={setTaxType}
              taxPercent={taxPercent}
              onTaxPercentChange={setTaxPercent}
              taxMode={taxMode}
              onTaxModeChange={setTaxMode}
              search={search}
              onSearchChange={setSearch}
            />

            <MenuItemsTable items={filteredItems} />
          </div>
        </div>
      </ConfigTransition>
    </main>
  );
}
