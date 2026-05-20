import { useForm } from '@tanstack/react-form'
import { createTodoSchema } from '../../shared/schemas/todo.schema'
import { useCreateTodo } from '../effects/todo.effects'

export function TodoFormView() {
  const createTodo = useCreateTodo()

  const form = useForm({
    defaultValues: { title: '', description: '' },
    validators: {
      onChange: ({ value }) => {
        const result = createTodoSchema.safeParse(value)
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(', ')
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      await createTodo.mutateAsync(value)
      form.reset()
    },
  })

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="title">
          {(field) => (
            <div>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="What needs doing?"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="error">
                  {field.state.meta.errors.join(', ')}
                </span>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Details (optional)"
            />
          )}
        </form.Field>

        <button type="submit" disabled={createTodo.isPending}>
          {createTodo.isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </form>
    </div>
  )
}
