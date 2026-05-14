import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import ChatWidget from "@/components/chatbot/chat-widget";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Smart Commerce",
    template: "%s | Smart Commerce",
  },
  description:
    "Your everyday essentials — groceries, beauty, home goods, gadgets and fashion, all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Smart Commerce",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "Smart Commerce",
    description: "Your everyday essentials, delivered fast.",
    siteName: "Smart Commerce",
  },
};

export const viewport: Viewport = {
  themeColor: "#f85606",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background px-2 text-foreground sm:px-4 lg:px-6">
        {children}
        <Toaster richColors position="top-right" />
        <ChatWidget position="bottom" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
