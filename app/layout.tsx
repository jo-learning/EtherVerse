import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Provider";
import { LoadingProvider } from "@/components/loadingPage";

export const metadata: Metadata = {
  title: "Pro Crypto Trading",
  description: "Trade cryptocurrencies with advanced tools and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LoadingProvider loading={false}>{children}</LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
