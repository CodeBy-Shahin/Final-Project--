"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/commerce";

type Address = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  district: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "bank">("cod");
  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    district: "",
    postalCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isSubmitting || isPending;

  const shippingFee = total >= 1000 ? 0 : 60;
  const orderTotal = total + shippingFee;

  function setField(field: keyof Address, value: string) {
    setAddress((a) => ({ ...a, [field]: value }));
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!address.name || !address.phone || !address.line1 || !address.city) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: {
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            district: address.district || undefined,
            postalCode: address.postalCode || undefined,
          },
          paymentMethod,
        }),
      });

      const result = (await response.json()) as { success: boolean; data?: { id: string }; message?: string };

      if (response.status === 401) {
        router.push("/login?next=/checkout&reason=auth");
        return;
      }

      if (!response.ok || !result.data) {
        setError(result.message ?? "Failed to place order.");
        return;
      }

      clear();
      toast.success("Order placed successfully!");

      startTransition(() => {
        router.push(`/orders/${result.data!.id}`);
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" asChild size="sm">
          <Link href="/cart">
            <ArrowLeft className="size-4" />
            Back to cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Delivery address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={address.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="phone">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      placeholder="01XXXXXXXXX"
                      value={address.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="line1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="line1"
                    placeholder="House/flat, road name"
                    value={address.line1}
                    onChange={(e) => setField("line1", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="line2">
                    Address line 2
                  </label>
                  <Input
                    id="line2"
                    placeholder="Area, neighbourhood (optional)"
                    value={address.line2}
                    onChange={(e) => setField("line2", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="city"
                      placeholder="Dhaka"
                      value={address.city}
                      onChange={(e) => setField("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="district">
                      District
                    </label>
                    <Input
                      id="district"
                      placeholder="Optional"
                      value={address.district}
                      onChange={(e) => setField("district", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="postalCode">
                      Postal code
                    </label>
                    <Input
                      id="postalCode"
                      placeholder="1000"
                      value={address.postalCode}
                      onChange={(e) => setField("postalCode", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Payment method</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {(["cod", "card", "bank"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      paymentMethod === method
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      {method === "cod" ? "Cash on delivery" : method === "card" ? "Card payment" : "Bank transfer"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {method === "cod" ? "Pay when delivered" : method === "card" ? "Debit/credit card" : "Bank wire"}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-6">
                <h2 className="font-semibold">Order summary</h2>
                <div className="mt-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <Badge variant="outline" className="text-xs">Free</Badge>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                <Button type="submit" className="mt-6 w-full" size="lg" disabled={isBusy}>
                  {isBusy ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Confirm order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
