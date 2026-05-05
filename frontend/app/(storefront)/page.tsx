import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  CookingPot,
  House,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";

import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts, getFeaturedProducts } from "@/lib/api";
import { formatPrice } from "@/lib/commerce";

const categoryMeta: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "grocery-essentials": { icon: ShoppingBasket, color: "text-emerald-700", bg: "bg-emerald-50" },
  "home-care":          { icon: House,          color: "text-sky-700",     bg: "bg-sky-50"     },
  "personal-care":      { icon: Sparkles,        color: "text-rose-700",    bg: "bg-rose-50"    },
  "kitchen-dining":     { icon: CookingPot,      color: "text-amber-700",   bg: "bg-amber-50"   },
  "electronics-gadgets":{ icon: Smartphone,      color: "text-violet-700",  bg: "bg-violet-50"  },
  "fashion-lifestyle":  { icon: Shirt,           color: "text-fuchsia-700", bg: "bg-fuchsia-50" },
};

const perks = [
  { icon: Truck,        title: "Fast delivery",    desc: "Orders dispatched quickly from in-stock inventory." },
  { icon: BadgePercent, title: "Daily deals",       desc: "Fresh markdowns and bundle offers every day." },
  { icon: ShieldCheck,  title: "Secure checkout",   desc: "Your payment and personal data are always protected." },
  { icon: Sparkles,     title: "Curated picks",     desc: "Handpicked groceries, beauty, home, and fashion finds." },
];

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedProducts(8), getAllProducts(18)]);

  const categories = Array.from(
    new Map(
      all.filter((p) => p.category).map((p) => [p.category!.slug, p.category!]),
    ).values(),
  );

  const spotlight = featured[0];
  const heroPreviews = featured.slice(1, 5);
  const deals = [...all]
    .sort((a, b) => ((b.compareAtPrice ?? b.price) - b.price) - ((a.compareAtPrice ?? a.price) - a.price))
    .slice(0, 4);

  return (
    <div className="pb-16">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-linear-to-b from-orange-50/60 to-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-16">

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Smart Commerce
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Everything you need,<br className="hidden sm:block" /> delivered fast.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Groceries, beauty, home essentials, and more — all in one place with the best prices in Bangladesh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-8">
                <Link href="/products">Shop now <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/products">Browse categories</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {spotlight && (
              <Link
                href={`/products/${spotlight.slug}`}
                className="group relative col-span-2 overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm sm:col-span-1"
              >
                {spotlight.images[0] ? (
                  <div className="relative aspect-square">
                    <Image
                      src={spotlight.images[0]}
                      alt={spotlight.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 22vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-secondary/60" />
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{spotlight.name}</p>
                  <p className="text-sm text-primary font-bold">{formatPrice(spotlight.price)}</p>
                </div>
              </Link>
            )}
            {heroPreviews.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
              >
                {p.images[0] ? (
                  <div className="relative aspect-square">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 12vw, 30vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-secondary/60" />
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-medium">{p.name}</p>
                  <p className="text-xs text-primary font-semibold">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category strip ───────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => {
              const meta = categoryMeta[cat.slug as keyof typeof categoryMeta];
              const Icon = meta?.icon ?? ShoppingBasket;
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <span className={`${meta?.color ?? "text-muted-foreground"}`}>
                    <Icon className="size-4" />
                  </span>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Featured</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Top picks this week</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/products">View all <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featured.slice(0, 8).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ── Deals banner ─────────────────────────────────────────── */}
      <section className="bg-primary/5 border-y border-primary/10">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">On sale</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Today&apos;s best deals</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">All deals <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Shop by category ─────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Browse</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Shop by category</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const meta = categoryMeta[cat.slug as keyof typeof categoryMeta];
            const Icon = meta?.icon ?? ShoppingBasket;
            const count = all.filter((p) => p.category?.slug === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <span className={`flex size-12 items-center justify-center rounded-xl ${meta?.bg ?? "bg-secondary"} ${meta?.color ?? ""}`}>
                  <Icon className="size-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{count} products</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Perks ────────────────────────────────────────────────── */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white border border-border/60 text-primary shadow-sm">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
