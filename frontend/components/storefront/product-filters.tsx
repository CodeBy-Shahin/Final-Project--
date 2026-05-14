"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { ProductSearchInput } from "@/components/storefront/product-search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  defaultQuery?: string;
  defaultSort?: string;
  defaultMin?: string;
  defaultMax?: string;
};

export function ProductFilters({ defaultQuery = "", defaultSort = "", defaultMin = "", defaultMax = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(defaultQuery);
  const [sort, setSort] = useState(defaultSort);
  const [min, setMin] = useState(defaultMin);
  const [max, setMax] = useState(defaultMax);

  const apply = useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      const values = { query, sort, min, max, ...overrides };

      if (values.query) params.set("query", values.query);
      else params.delete("query");
      if (values.sort) params.set("sort", values.sort);
      else params.delete("sort");
      if (values.min) params.set("min", values.min);
      else params.delete("min");
      if (values.max) params.set("max", values.max);
      else params.delete("max");

      router.push(`/products?${params.toString()}`);
    },
    [query, sort, min, max, router, searchParams],
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <ProductSearchInput
          value={query}
          onChange={setQuery}
          onSearch={(value) => apply({ query: value })}
          placeholder="Search products..."
          className="flex-1"
        />
        <Button onClick={() => apply({ query })} size="default">
          Search
        </Button>
      </div>

      <details className="group rounded-2xl border border-border/70 bg-white">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium select-none">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Filters &amp; sort
        </summary>
        <div className="border-t border-border/60 p-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "", label: "Relevance" },
                { value: "price-asc", label: "Price: low to high" },
                { value: "price-desc", label: "Price: high to low" },
                { value: "rating", label: "Top rated" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    apply({ sort: opt.value });
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Price range (BDT)</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="h-9 w-24 text-sm"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="h-9 w-24 text-sm"
              />
              <Button size="sm" variant="outline" onClick={() => apply({ min, max })}>
                Apply
              </Button>
              {(min || max) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setMin("");
                    setMax("");
                    apply({ min: "", max: "" });
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
