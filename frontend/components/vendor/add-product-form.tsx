"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; slug: string };

export function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    price: "",
    compareAtPrice: "",
    stock: "0",
    images: "",
    featured: false,
    status: "active" as "active" | "draft",
  });

  function setField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.description || !form.categoryId || !form.price) {
      setError("Please fill in all required fields.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        stock: Number(form.stock),
        images: form.images
          ? form.images
              .split("\n")
              .map((u) => u.trim())
              .filter(Boolean)
          : [],
        featured: form.featured,
        status: form.status,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as { success: boolean; message?: string };
      if (res.ok) {
        toast.success("Product created successfully");
        router.push("/vendor/products");
        router.refresh();
      } else {
        setError(result.message ?? "Failed to create product");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild size="sm" className="-ml-2">
        <Link href="/vendor/products">
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/70">
              <CardContent className="grid gap-4 p-6">
                <h2 className="font-semibold">Basic information</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Product name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Organic Basmati Rice 1kg"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Describe the product…"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.categoryId}
                    onChange={(e) => setField("categoryId", e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="grid gap-4 p-6">
                <h2 className="font-semibold">Pricing &amp; stock</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price (BDT) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compare at (BDT)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Original price"
                      value={form.compareAtPrice}
                      onChange={(e) => setField("compareAtPrice", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => setField("stock", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="grid gap-4 p-6">
                <h2 className="font-semibold">Images</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URLs (one per line)</label>
                  <textarea
                    className="min-h-[80px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="https://example.com/image.jpg"
                    value={form.images}
                    onChange={(e) => setField("images", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border-border/70">
              <CardContent className="grid gap-4 p-6">
                <h2 className="font-semibold">Publish</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as "active" | "draft")}
                  >
                    <option value="active">Active (visible in store)</option>
                    <option value="draft">Draft (hidden)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setField("featured", e.target.checked)}
                    className="rounded"
                  />
                  Featured product
                </label>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create product"
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
