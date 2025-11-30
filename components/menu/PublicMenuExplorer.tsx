"use client";

import { useMemo, useState, type SVGProps } from "react";
import type { PublicMenuSection } from "@/types/menu";

const rial = new Intl.NumberFormat("fa-IR", {
  style: "currency",
  currency: "IRR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

interface PublicMenuExplorerProps {
  sections: PublicMenuSection[];
}

export default function PublicMenuExplorer({ sections }: PublicMenuExplorerProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");

  const categories = useMemo(() => {
    const unique = sections
      .filter((section) => section.items.length > 0)
      .map((section) => section.category);
    return ["همه", ...unique];
  }, [sections]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return sections
      .filter((section) => (selectedCategory === "همه" ? true : section.category === selectedCategory))
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => (normalizedQuery ? item.name.toLowerCase().includes(normalizedQuery) : true))
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, normalizedQuery, selectedCategory]);

  const totalVisibleItems = filteredSections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm shadow-emerald-50">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <label htmlFor="menu-search" className="sr-only">
              جستجوی آیتم
            </label>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="menu-search"
              type="text"
              placeholder="جستجوی سریع آیتم (مثلاً لاته، سالاد...)"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500">{totalVisibleItems} آیتم نمایش داده می‌شود</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  isActive ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {filteredSections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-500">
          نتیجه‌ای برای جستجوی شما پیدا نشد.
        </div>
      ) : (
        filteredSections.map((section) => (
          <article key={section.category} className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">CATEGORY</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{section.category}</h2>
              </div>
              <span className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600">{section.items.length} آیتم</span>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {section.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-400">قیمت به‌روز کافه</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-700" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    {rial.format(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))
      )}
    </div>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </svg>
  );
}
