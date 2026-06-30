import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bahçe Cafe Hisarüstü",
  description: "Menü ve Yönetim Sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
