"use client"

import "./globals.css"
import Header from "@/components/layout/nav/header"
import Footer from "@/components/layout/nav/footer"
import { Toaster } from "@/components/ui/sonner"

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-(--bg)">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        closeButton
        gap={8}
        visibleToasts={3}
      />
    </div>
  )
}
