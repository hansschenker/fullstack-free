import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../auth-client'

type LayoutProps = {
  children: ReactNode
  userName?: string | null
}

export function LayoutView({ children, userName }: LayoutProps) {
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    queryClient.clear()
    await authClient.signOut()
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Fullstack MVU Todo</h1>
            <p className="header-subtitle">TanStack + Hono + Cloudflare Workers</p>
          </div>
          {userName && (
            <div className="header-user">
              <span className="user-name">{userName}</span>
              <button onClick={handleSignOut} className="btn-sign-out">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>Built with MVU Architecture</p>
      </footer>
    </div>
  )
}
