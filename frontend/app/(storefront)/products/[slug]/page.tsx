import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Star,
  TicketPercent,
  Truck,
} from "lucide-react";

import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductBySlug } from "@/lib/api";
import { formatCompactNumber, formatPrice, getDiscountPercentage, getStockMessage } from "@/lib/commerce";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const discount = getDiscountPercentage(product);
  const stockMessage = getStockMessage(product);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[28px] border-border/70">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
              <div className="absolute left-5 top-5 flex gap-2">
                <Badge>{product.category?.name ?? "Featured"}</Badge>
                {discount > 0 ? <Badge className="bg-primary text-primary-foreground">Save {discount}%</Badge> : null}
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border-border/70">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-2xl bg-secondary/55 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Recent demand
                </div>
                <p className="mt-3 text-3xl font-bold">{formatCompactNumber(product.metrics.sales30d)}</p>
                <p className="text-sm text-muted-foreground">Units sold in 30 days</p>
              </div>
              <div className="rounded-2xl bg-secondary/55 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star className="size-4 text-primary" />
                  Rating
                </div>
                <p className="mt-3 text-3xl font-bold">{product.rating}</p>
                <p className="text-sm text-muted-foreground">Average shopper rating</p>
              </div>
              <div className="rounded-2xl bg-secondary/55 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  Catalog health
                </div>
                <p className="mt-3 text-3xl font-bold">{product.stock}</p>
                <p className="text-sm text-muted-foreground">Units available right now</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border/70">
            <CardHeader>
              <CardTitle>Product details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>{product.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-background p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">SKU</div>
                  <div className="mt-2 text-base font-semibold text-foreground">{product.sku}</div>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tags</div>
                  <div className="mt-2 text-base font-semibold text-foreground">{product.tags.join(", ")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card className="rounded-[28px] border-border/70">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>{product.category?.name ?? "Featured"}</Badge>
                  <Badge variant={product.stock <= product.reorderPoint ? "warning" : "success"}>
                    {stockMessage}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="size-4 fill-current text-amber-400" />
                  {product.rating} rating
                  <span>·</span>
                  {formatCompactNumber(product.metrics.views30d)} views in 30 days
                </div>
              </div>

              <div className="rounded-3xl bg-secondary/55 p-5">
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold tracking-tight text-primary">{formatPrice(product.price)}</div>
                  {product.compareAtPrice ? (
                    <div className="pb-1 text-lg text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </div>
                  ) : null}
                </div>
                {discount > 0 ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary">
                    <TicketPercent className="size-4" />
                    Save {discount}% today
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 rounded-3xl border border-border bg-background p-5 text-sm leading-7 text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Truck className="size-4 text-primary" />
                  Delivery notes
                </div>
                <p>Estimated dispatch within 24 hours after order confirmation.</p>
                <p>Cash on delivery and future checkout workflows can be layered onto this product flow.</p>
              </div>

              <AddToCartButton product={product} />
            </CardContent>
          </Card>
        </div>
      </div>

      {product.related?.length ? (
        <section className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Related picks</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Keep shopping in the same lane</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {product.related.map((related) => (
              <ProductCard
                key={related.slug}
                product={{
                  ...product,
                  ...related,
                  description: product.description,
                  compareAtPrice: undefined,
                  featured: false,
                  reorderPoint: product.reorderPoint,
                  tags: product.tags,
                  metrics: product.metrics,
                  category: product.category,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
