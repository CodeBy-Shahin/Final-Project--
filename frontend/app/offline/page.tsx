import Link from "next/link";

export const metadata = { title: "You're offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">📦</div>
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="max-w-sm text-muted-foreground">
        No internet connection detected. Check your network and try again.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Try again
      </Link>
    </div>
  );
}
