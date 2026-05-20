import { useTodos, useToggleTodo, useDeleteTodo } from '../effects/todo.effects'
import { useSelector, useTodoDispatch } from '../mvu'
import type { TodoFilter } from '../models/todo.model'

type Todo = {
  id: string
  title: string
  description: string | null
  isComplete: boolean
  createdAt: string
  updatedAt: string
}

export function TodoListView() {
  const { data: todos = [], isLoading, error } = useTodos()
  const filter = useSelector((m) => m.todo.filter)
  const dispatch = useTodoDispatch()
  const filtered = filterTodos(todos, filter)

  if (isLoading) return <div className="todo-loading">Loading...</div>
  if (error) return <div className="todo-error">Error: {error.message}</div>

  return (
    <section className="todo-section">
      <FilterBar current={filter} onFilter={(f) => dispatch({ type: 'SET_FILTER', filter: f })} />
      <ul className="todo-list">
        {filtered.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      {filtered.length === 0 && <EmptyState filter={filter} />}
    </section>
  )
}

function FilterBar({ current, onFilter }: { current: TodoFilter; onFilter: (f: TodoFilter) => void }) {
  const filters: TodoFilter[] = ['all', 'active', 'completed']
  return (
    <nav className="filter-bar">
      {filters.map((f) => (
        <button key={f} className="filter-btn" onClick={() => onFilter(f)} data-active={f === current}>
          {f}
        </button>
      ))}
    </nav>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  const toggle = useToggleTodo()
  const remove = useDeleteTodo()

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.isComplete}
        onChange={() => toggle.mutate({ id: todo.id, isComplete: !todo.isComplete })}
      />
      <span className="todo-title" data-complete={todo.isComplete}>{todo.title}</span>
      <button className="btn-delete-todo" onClick={() => remove.mutate(todo.id)} disabled={remove.isPending}>
        ✕
      </button>
    </li>
  )
}

function EmptyState({ filter }: { filter: TodoFilter }) {
  const messages: Record<TodoFilter, string> = {
    all: 'No todos yet. Add one above.',
    active: 'All caught up!',
    completed: 'Nothing completed yet.',
  }
  return <p className="todo-empty">{messages[filter]}</p>
}

function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'all':       return todos
    case 'active':    return todos.filter((t) => !t.isComplete)
    case 'completed': return todos.filter((t) => t.isComplete)
  }
}
