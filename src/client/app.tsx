import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MVUProvider } from './mvu'
import { LayoutView } from './views/layout.view'
import { TodoListView } from './views/todo-list.view'
import { TodoFormView } from './views/todo-form.view'

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
  return (
    <QueryClientProvider client={queryClient}>
      <MVUProvider>
        <LayoutView>
          <TodoFormView />
          <TodoListView />
        </LayoutView>
      </MVUProvider>
    </QueryClientProvider>
  )
}
