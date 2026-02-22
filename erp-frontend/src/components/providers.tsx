"use client"

import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TabsProvider } from "@/contexts/tabs-context"
import { ExportProvider } from "@/contexts/export-context"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <ThemeProvider defaultTheme="light" storageKey="erp-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TabsProvider>
          <ExportProvider>{children}</ExportProvider>
        </TabsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}


