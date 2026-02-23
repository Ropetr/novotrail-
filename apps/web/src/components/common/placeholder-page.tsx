import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface PlaceholderPageProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PlaceholderPage({ title, description, actions }: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {actions}
      </div>
      <Card>
        <CardHeader className="flex h-8 flex-row items-center justify-between border-b px-3 py-0">
          <CardTitle className="text-lg">Em construcao</CardTitle>
          {description ? (
            <CardDescription className="ml-2 text-xs">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Esta tela esta pronta para receber a implementacao seguindo o padrao do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
