"use client";

import type { OfficialGuideItem } from "@/lib/types";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export function GuideTable({ items }: { items: OfficialGuideItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mapName, setMapName] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items],
  );
  const maps = useMemo(
    () => Array.from(new Set(items.map((item) => item.mapName))).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesMap = mapName === "all" || item.mapName === mapName;
      const haystack = [
        item.itemName,
        item.category,
        item.mapName,
        item.locationDescription,
        item.notes,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        matchesMap &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [category, items, mapName, query]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035]">
      <div className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-[1fr_220px_220px]">
        <label className="relative block">
          <span className="sr-only">Search official guide items</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search item, map, location, notes"
            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="all">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by map</span>
          <select
            value={mapName}
            onChange={(event) => setMapName(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          >
            <option value="all">All maps</option>
            {maps.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">
          No guide items match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Map</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Verified</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-white/[0.08]">
                  <td className="px-4 py-4 align-top font-medium text-white">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-4 align-top text-slate-300">
                    {item.category}
                  </td>
                  <td className="px-4 py-4 align-top text-slate-300">
                    {item.mapName}
                  </td>
                  <td className="max-w-sm px-4 py-4 align-top leading-6 text-slate-300">
                    {item.locationDescription}
                  </td>
                  <td className="max-w-sm px-4 py-4 align-top leading-6 text-slate-400">
                    {item.notes}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={
                        item.verified
                          ? "rounded-full border border-emerald-300/50 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-100"
                          : "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400"
                      }
                    >
                      {item.verified ? "Verified" : "Seed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
