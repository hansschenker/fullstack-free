import type { ReactNode } from 'react'

export function LayoutView({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <header>
        <h1>Fullstack MVU Todo</h1>
        <p>TanStack + Hono + Cloudflare Workers</p>
      </header>
      <main>{children}</main>
      <footer>
        <p>Built with MVU Architecture</p>
      </footer>
    </div>
  )
}
