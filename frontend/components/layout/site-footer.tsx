export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Smart Commerce</p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Shop smarter for groceries, home care, kitchen, beauty, and everyday deals.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            Built as a marketplace-style storefront on top of an admin-ready analytics and
            governance platform. Great for customer shopping, even better for operations.
          </p>
          <div className="rounded-2xl border border-border bg-secondary/50 p-4 text-sm leading-7 text-muted-foreground">
            Hotline: <span className="font-semibold text-foreground">+880 1700-000000</span>
            <br />
            Support: <span className="font-semibold text-foreground">support@smartcommerce.local</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Customer Care</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Help Center</li>
            <li>How to Buy</li>
            <li>Returns & Refunds</li>
            <li>Track Your Order</li>
            <li>Delivery Information</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Shop by Category</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Grocery Essentials</li>
            <li>Home Care</li>
            <li>Personal Care</li>
            <li>Kitchen & Dining</li>
            <li>Electronics & Gadgets</li>
            <li>Fashion & Lifestyle</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Platform Layer</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Admin dashboard access</li>
            <li>MongoDB-backed catalog</li>
            <li>Audit logs and governance</li>
            <li>Analytics-ready backend</li>
            <li>Seedable demo environment</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 Smart Commerce. Marketplace-inspired storefront with dashboard-grade operations.</p>
          <p>Payments, delivery, and stock workflows can be extended from the existing backend foundation.</p>
        </div>
      </div>
    </footer>
  );
}
