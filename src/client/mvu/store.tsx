import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'

export function createMVUStore<Model, Msg>(
  initialModel: Model,
  update: (model: Model, msg: Msg) => Model
) {
  const ModelContext = createContext<Model>(initialModel)
  const DispatchContext = createContext<Dispatch<Msg>>(() => {})

  function Provider({ children }: { children: ReactNode }) {
    const [model, dispatch] = useReducer(update, initialModel)
    return (
      <ModelContext.Provider value={model}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </ModelContext.Provider>
    )
  }

  function useModel(): Model {
    return useContext(ModelContext)
  }

  function useDispatch(): Dispatch<Msg> {
    return useContext(DispatchContext)
  }

  function useSelector<T>(selector: (model: Model) => T): T {
    const model = useContext(ModelContext)
    return selector(model)
  }

  return { Provider, useModel, useDispatch, useSelector }
}
