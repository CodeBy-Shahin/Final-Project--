"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import { formatPrice, getDiscountPercentage, getStockMessage } from "@/lib/commerce";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = getDiscountPercentage(product);
  const stockMessage = getStockMessage(product);

  function handleAddToCart() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/70 bg-white transition-transform duration-200 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-2">
            {discount > 0 ? <Badge className="bg-primary text-primary-foreground">-{discount}%</Badge> : null}
            <Badge variant="outline" className="bg-white/95">
              {product.category?.name ?? "Featured"}
            </Badge>
          </div>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full bg-white/92 text-muted-foreground shadow-sm transition-colors hover:text-primary"
            aria-label={`Save ${product.name}`}
          >
            <Heart className="size-4" />
          </button>
        </div>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-current text-amber-400" />
            {product.rating}
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{stockMessage}</span>
        </div>

        <div>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 text-base font-semibold leading-6 hover:text-primary"
          >
            {product.name}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-bold tracking-tight text-primary">{formatPrice(product.price)}</div>
            {product.compareAtPrice ? (
              <div className="mt-1 text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </div>
            ) : null}
          </div>
          <div className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            SKU {product.sku}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Button
            className="h-10"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="size-4" />
            {product.stock === 0 ? "Out of stock" : "Add to cart"}
          </Button>
          <Button variant="outline" asChild className="h-10">
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
