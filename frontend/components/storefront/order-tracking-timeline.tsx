import { CheckCircle2, Circle, Clock3, PackageCheck, Truck } from "lucide-react";

type TrackingEvent = {
  status: string;
  label: string;
  description: string;
  location?: string;
  createdAt: string;
};

type Shipment = {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  currentLocation?: string;
};

const trackingSteps = [
  {
    status: "pending",
    title: "Order placed",
    description: "Waiting for admin approval.",
    icon: Clock3,
  },
  {
    status: "processing",
    title: "Approved and packed",
    description: "Products are being prepared for courier pickup.",
    icon: PackageCheck,
  },
  {
    status: "shipped",
    title: "Shipped",
    description: "Parcel is moving through the delivery network.",
    icon: Truck,
  },
  {
    status: "delivered",
    title: "Delivered",
    description: "Order reached the delivery address.",
    icon: CheckCircle2,
  },
];

const statusRank = trackingSteps.reduce<Record<string, number>>((acc, step, index) => {
  acc[step.status] = index;
  return acc;
}, {});

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OrderTrackingTimeline({
  status,
  shipment,
  trackingEvents = [],
}: {
  status: string;
  shipment?: Shipment;
  trackingEvents?: TrackingEvent[];
}) {
  const currentRank = statusRank[status] ?? 0;
  const isCancelled = status === "cancelled";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl border border-border/70 bg-secondary/30 p-4 text-sm sm:grid-cols-3">
        <div>
          <div className="text-muted-foreground">Carrier</div>
          <div className="mt-1 font-semibold">{shipment?.carrier ?? "Assigned after shipping"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Tracking number</div>
          <div className="mt-1 font-mono text-xs font-semibold">
            {shipment?.trackingNumber ?? "Pending"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Estimated delivery</div>
          <div className="mt-1 font-semibold">{formatDate(shipment?.estimatedDelivery) ?? "Pending"}</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {trackingSteps.map((step, index) => {
          const Icon = step.icon;
          const complete = !isCancelled && index <= currentRank;
          const active = !isCancelled && index === currentRank;

          return (
            <div
              key={step.status}
              className={`rounded-xl border p-4 ${
                complete
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/70 bg-background"
              }`}
            >
              <div
                className={`mb-3 flex size-9 items-center justify-center rounded-full ${
                  complete ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <div className="text-sm font-semibold">{step.title}</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</div>
              {active && <div className="mt-3 text-xs font-semibold text-primary">Current step</div>}
            </div>
          );
        })}
      </div>

      {isCancelled ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          This order was cancelled before delivery.
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Tracking activity</h3>
        <div className="space-y-3">
          {trackingEvents.length === 0 ? (
            <div className="rounded-xl border border-border/70 p-4 text-sm text-muted-foreground">
              Tracking activity will appear after the first order update.
            </div>
          ) : (
            trackingEvents
              .slice()
              .reverse()
              .map((event, index) => (
                <div key={`${event.status}-${event.createdAt}-${index}`} className="flex gap-3">
                  <div className="pt-1">
                    <Circle className="size-3 fill-primary text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-border/70 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{event.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <p className="mt-1 text-muted-foreground">{event.description}</p>
                    {event.location ? (
                      <div className="mt-2 text-xs font-medium text-foreground">{event.location}</div>
                    ) : null}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
