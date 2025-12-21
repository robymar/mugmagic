import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MugMagic | Custom Personalized Gifts",
  description: "Design your own mugs with our easy 2D editor and stunning 3D preview. Premium quality, fast shipping worldwide.",
  keywords: ["custom mugs", "personalized gifts", "3D preview", "design your own", "printed mugs"],
  openGraph: {
    title: "MugMagic - Create Your Perfect Mug",
    description: "Design personalized mugs in 2D and preview in 3D",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Global Header */}
        <Header />

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Cart Drawer */}
        <CartDrawer />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
