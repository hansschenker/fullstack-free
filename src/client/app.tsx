import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MVUProvider } from './mvu'
import { LayoutView } from './views/layout.view'
import { TodoListView } from './views/todo-list.view'
import { TodoFormView } from './views/todo-form.view'
import { AuthView } from './views/auth.view'
import { authClient } from './auth-client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
    },
  },
})

export function App() {
  const session = authClient.useSession()

  if (session.isPending) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!session.data?.user) {
    return <AuthView />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MVUProvider>
        <LayoutView userName={session.data.user.name}>
          <TodoFormView />
          <TodoListView />
        </LayoutView>
      </MVUProvider>
    </QueryClientProvider>
  )
}
