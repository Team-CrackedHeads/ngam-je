import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { ClerkProvider } from "@clerk/nextjs";
// import { AuthProvider } from "@/contexts/AuthContext"; // TODO: Remove after migration

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ngam-je",
  description: "Connecting buyers and sellers seamlessly with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full overflow-hidden" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col overflow-y-auto`}
          style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
        >
          <SidebarProvider className="flex-col">
            <Header />
            <div className="flex-1 flex min-h-0 w-full">
              <AppSidebar />
              <main className="flex-1 min-h-0 overflow-auto">
                {children}
              </main>
            </div>
            <Footer />
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
