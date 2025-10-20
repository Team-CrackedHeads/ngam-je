import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";
import { MockAuthProvider } from "@/lib/auth";
import { AuthRoleToggle } from "@/components/dev/AuthRoleToggle";

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
    <html lang="en" className="h-full overflow-hidden" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col overflow-y-auto`}
        style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
      >
        <MockAuthProvider>
          <Header username="User" notifications={3} />
          <div className="flex-1 flex min-h-0">
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 min-h-0 overflow-auto">
                {children}
              </main>
            </SidebarProvider>
          </div>
          <Footer />

          {/* Dev-only: Role toggle in bottom-right corner */}
          <AuthRoleToggle />
        </MockAuthProvider>
      </body>
    </html>

  );
}
