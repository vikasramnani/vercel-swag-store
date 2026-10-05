import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { Footer } from "./components/footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vercel Swag Store",
    template: "%s · Vercel Swag Store",
  },
  description: "Official Vercel merchandise.",
  openGraph: {
    title: "Vercel Swag Store",
    description: "Official Vercel merchandise.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </div>
        <Footer />
      </body>
      
    </html>
  );
}
