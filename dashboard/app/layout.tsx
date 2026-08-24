import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SurgiWaste AI - Hospital Operating Theatre Waste Intelligence",
  description: "Enterprise SaaS for Clinical Waste Diversion, Cost Reduction, and Scope 3 ESG Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-slate-900 flex min-h-screen antialiased selection:bg-emerald-100 selection:text-emerald-900`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto bg-slate-50/60">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
