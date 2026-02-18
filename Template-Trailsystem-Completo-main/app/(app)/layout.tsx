"use client"

import React from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { TabsBar } from "@/components/dashboard/tabs-bar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-[200px]">
        <TabsBar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
