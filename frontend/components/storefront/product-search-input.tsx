"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProductSuggestion = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string | null;
  tags: string[];
};

type ProductSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
};

export function ProductSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  name = "query",
  className,
  inputClassName,
}: ProductSearchInputProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadSuggestions() {
      try {
        const response = await fetch("/api/product-suggestions");
        if (!response.ok) return;

        const payload = (await response.json()) as {
          data?: ProductSuggestion[];
        };

        if (!ignore) {
          setProducts(payload.data ?? []);
        }
      } catch {
        if (!ignore) {
          setProducts([]);
        }
      }
    }

    loadSuggestions();

    return () => {
      ignore = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    const normalizedQuery = value.trim().toLowerCase();
    if (!normalizedQuery) return products.slice(0, 6);

    return products
      .filter((product) => {
        const searchable = [product.name, product.category ?? "", ...product.tags]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(normalizedQuery);
        const bStarts = b.name.toLowerCase().startsWith(normalizedQuery);
        if (aStarts === bStarts) return a.name.localeCompare(b.name);
        return aStarts ? -1 : 1;
      })
      .slice(0, 6);
  }, [products, value]);

  const showSuggestions = isFocused && suggestions.length > 0;

  function openProduct(product: ProductSuggestion) {
    onChange(product.name);
    router.push(`/products/${product.slug}`);
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSearch(value);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={cn("pl-9", inputClassName)}
      />

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-border bg-white shadow-xl">
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openProduct(product)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="size-full object-cover" />
                ) : (
                  <Search className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {product.category ?? "Product"} - BDT {product.price}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
