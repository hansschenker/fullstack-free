import type { ReactNode } from 'react'

export type Update<Model, Msg> = (model: Model, msg: Msg) => Model
export type View<Model, Msg> = (model: Model, dispatch: Dispatch<Msg>) => ReactNode
export type Dispatch<Msg> = (msg: Msg) => void
