import Link from "next/link";

import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { getAllProducts } from "@/lib/api";

type SearchParams = Promise<{
  category?: string | string[];
  query?: string | string[];
  sort?: string | string[];
  min?: string | string[];
  max?: string | string[];
}>;

export const metadata = { title: "Products" };

function val(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const [products, params] = await Promise.all([getAllProducts(100), searchParams]);

  const activeCategory = val(params.category);
  const query = val(params.query)?.toLowerCase().trim() ?? "";
  const sort = val(params.sort) ?? "";
  const minPrice = Number(val(params.min)) || 0;
  const maxPrice = Number(val(params.max)) || Infinity;

  const categories = Array.from(
    new Map(
      products.filter((p) => p.category).map((p) => [p.category!.slug, p.category!]),
    ).values(),
  );

  const filtered = products
    .filter((p) => {
      if (activeCategory && p.category?.slug !== activeCategory) return false;
      if (query) {
        const hay = `${p.name} ${p.description} ${p.category?.name ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (p.price < minPrice) return false;
      if (p.price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return 0;
    });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Categories
            </p>
            <div className="space-y-1">
              <Link
                href="/products"
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  !activeCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary/60"
                }`}
              >
                All products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}${query ? `&query=${query}` : ""}${sort ? `&sort=${sort}` : ""}`}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary/60"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="space-y-5">
          {/* Search + filters (client component) */}
          <ProductFilters
            defaultQuery={query}
            defaultSort={sort}
            defaultMin={val(params.min) ?? ""}
            defaultMax={val(params.max) ?? ""}
          />

          {/* Active filter chips */}
          {(activeCategory || query || sort || minPrice || maxPrice < Infinity) && (
            <div className="flex flex-wrap gap-2 text-sm">
              {activeCategory && (
                <Link
                  href={`/products${query ? `?query=${query}` : ""}`}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary font-medium"
                >
                  {categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory} ✕
                </Link>
              )}
              {query && (
                <Link
                  href={`/products${activeCategory ? `?category=${activeCategory}` : ""}`}
                  className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-muted-foreground font-medium"
                >
                  &quot;{query}&quot; ✕
                </Link>
              )}
              {(minPrice > 0 || maxPrice < Infinity) && (
                <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground font-medium">
                  BDT {minPrice}–{maxPrice < Infinity ? maxPrice : "∞"}
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-semibold">No products found</p>
              <p className="mt-2 text-muted-foreground">Try adjusting your search or filters.</p>
              <Link
                href="/products"
                className="mt-4 inline-block text-primary underline underline-offset-4"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
