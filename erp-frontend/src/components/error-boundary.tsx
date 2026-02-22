"use client"

import React from "react"

interface ErrorBoundaryState {
  hasError: boolean
  message?: string
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error("[AppErrorBoundary] Erro nao tratado:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 text-center">
            <h1 className="text-lg font-semibold">Ocorreu um erro na tela</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente atualizar a pagina. Se o problema continuar, entre em contato com o suporte.
            </p>
            {this.state.message && (
              <p className="mt-3 text-xs text-muted-foreground break-words">
                Detalhe: {this.state.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}


