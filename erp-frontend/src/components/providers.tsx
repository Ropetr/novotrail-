"use client"

import React from "react"
import { TabsProvider } from "@/contexts/tabs-context"
import { ExportProvider } from "@/contexts/export-context"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="erp-ui-theme">
      <TabsProvider>
        <ExportProvider>{children}</ExportProvider>
      </TabsProvider>
    </ThemeProvider>
  )
}
