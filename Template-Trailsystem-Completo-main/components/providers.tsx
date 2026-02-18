"use client"

import React from "react"
import { TabsProvider } from "@/contexts/tabs-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <TabsProvider>{children}</TabsProvider>
}
