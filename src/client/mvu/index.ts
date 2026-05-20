import { createMVUStore } from './store'
import { AppModel, AppMsg, initialAppModel, appUpdate } from '../models/app.model'
import type { TodoMsg } from '../models/todo.model'

export const {
  Provider: MVUProvider,
  useModel,
  useDispatch,
  useSelector,
} = createMVUStore<AppModel, AppMsg>(initialAppModel, appUpdate)

export function useTodoDispatch() {
  const dispatch = useDispatch()
  return (msg: TodoMsg) =>
    dispatch({ domain: 'todo', msg })
}
