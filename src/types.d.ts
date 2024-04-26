export type Leaf = {
    title: string
    path: string
}

export type Branch = {
    children?: Tree
} & Leaf

export type Tree = Branch[]

export interface Storage {
    notes: () => Node[]
    note: () => Promise<string>
}

export type Node = {
    title: string
    path: string
    children: Node[]
}

