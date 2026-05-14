import { API_BASE_URL } from "@/lib/config";
import { AddProductForm } from "@/components/vendor/add-product-form";

type Category = { id: string; name: string; slug: string };

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=1`);
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { filters?: Category[] } };
    return data.data?.filters ?? [];
  } catch {
    return [];
  }
}

export const metadata = { title: "Add Product — Vendor" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add product</h1>
        <p className="mt-1 text-muted-foreground">Create a new product listing.</p>
      </div>
      <AddProductForm categories={categories} />
    </div>
  );
}
