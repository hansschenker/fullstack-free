import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from '../api'
import type { InferResponseType } from 'hono/client'
import type {
  CreateTodoInput,
  UpdateTodoInput,
} from '../../shared/schemas/todo.schema'

type TodoResponse = InferResponseType<typeof api.api.todos.$get>[number]

export const todoKeys = {
  all:    ['todos'] as const,
  detail: (id: string) => ['todos', id] as const,
}

export function useTodos() {
  return useQuery({
    queryKey: todoKeys.all,
    queryFn: async () => {
      const res = await api.api.todos.$get()
      if (!res.ok) throw new Error('Failed to fetch todos')
      return res.json()
    },
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: async () => {
      const res = await api.api.todos[':id'].$get({ param: { id } })
      if (!res.ok) throw new Error('Todo not found')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTodoInput) => {
      const res = await api.api.todos.$post({ json: data })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTodoInput }) => {
      const res = await api.api.todos[':id'].$put({
        param: { id },
        json: data,
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: (todo) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
      queryClient.setQueryData(todoKeys.detail(todo.id), todo)
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.api.todos[':id'].$delete({ param: { id } })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isComplete }: { id: string; isComplete: boolean }) => {
      const res = await api.api.todos[':id'].$put({
        param: { id },
        json: { isComplete },
      })
      if (!res.ok) throw new Error('Failed to toggle')
      return res.json()
    },
    onMutate: async ({ id, isComplete }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.all })
      const previous = queryClient.getQueryData<TodoResponse[]>(todoKeys.all)
      queryClient.setQueryData<TodoResponse[]>(todoKeys.all, (old) =>
        old?.map((t) => (t.id === id ? { ...t, isComplete } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(todoKeys.all, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
