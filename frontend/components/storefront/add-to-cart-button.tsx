"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
};

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
    });
    toast.success(`${product.name} added to cart`, {
      action: { label: "View cart", onClick: () => window.location.assign("/cart") },
    });
  }

  if (product.stock === 0) {
    return (
      <Button size="lg" disabled className="w-full">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="grid gap-3">
      <Button size="lg" onClick={handleAddToCart}>
        <ShoppingCart className="size-4" />
        Add to cart
      </Button>
      <Button size="lg" variant="outline" onClick={() => {
        handleAddToCart();
        window.location.assign("/checkout");
      }}>
        Buy now
      </Button>
    </div>
  );
}
