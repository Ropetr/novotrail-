import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'TrailSystem ERP - Sistema de Gestão Empresarial',
  description: 'Sistema completo de gestão empresarial para controle de vendas, estoque, financeiro e muito mais.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#E84C3D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
