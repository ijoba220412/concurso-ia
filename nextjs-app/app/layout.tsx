import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Concurseiro AI',
  description: 'Sistema de busca de concursos públicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {children}
      </body>
    </html>
  )
}