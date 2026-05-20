export type TodoFilter = 'all' | 'active' | 'completed'

export type TodoModel = {
  filter: TodoFilter
  editingId: string | null
  optimisticToggles: Set<string>
}

export const initialTodoModel: TodoModel = {
  filter: 'all',
  editingId: null,
  optimisticToggles: new Set(),
}

export type TodoMsg =
  | { type: 'SET_FILTER'; filter: TodoFilter }
  | { type: 'START_EDITING'; id: string }
  | { type: 'STOP_EDITING' }
  | { type: 'OPTIMISTIC_TOGGLE'; id: string }
  | { type: 'RESOLVE_TOGGLE'; id: string }

export function todoUpdate(model: TodoModel, msg: TodoMsg): TodoModel {
  switch (msg.type) {
    case 'SET_FILTER':
      return { ...model, filter: msg.filter }

    case 'START_EDITING':
      return { ...model, editingId: msg.id }

    case 'STOP_EDITING':
      return { ...model, editingId: null }

    case 'OPTIMISTIC_TOGGLE': {
      const next = new Set(model.optimisticToggles)
      next.add(msg.id)
      return { ...model, optimisticToggles: next }
    }

    case 'RESOLVE_TOGGLE': {
      const next = new Set(model.optimisticToggles)
      next.delete(msg.id)
      return { ...model, optimisticToggles: next }
    }
  }
}
