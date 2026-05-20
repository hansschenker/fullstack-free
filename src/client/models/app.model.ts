import { TodoModel, TodoMsg, initialTodoModel, todoUpdate } from './todo.model'

export type AppModel = {
  todo: TodoModel
}

export const initialAppModel: AppModel = {
  todo: initialTodoModel,
}

export type AppMsg =
  | { domain: 'todo'; msg: TodoMsg }

export function appUpdate(model: AppModel, appMsg: AppMsg): AppModel {
  switch (appMsg.domain) {
    case 'todo':
      return { ...model, todo: todoUpdate(model.todo, appMsg.msg) }
  }
}
