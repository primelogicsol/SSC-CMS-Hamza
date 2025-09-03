import "./globals.css";
import type { ReactNode } from "react";
import Header from "./components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
