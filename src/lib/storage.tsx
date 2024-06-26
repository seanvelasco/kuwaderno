import {
	createContext,
	useContext,
	createSignal,
	onMount,
	type JSXElement
} from "solid-js"
import { createStorage } from "unstorage"
import driver from "unstorage/drivers/github"
import { useLocation } from "@solidjs/router"
import { ALLOWED_FILES } from "~/lib/constants"
import type { Storage, Node } from "../types.d.ts"

const createDirectoryTree = (paths: string[]) => {
	const tree: Node[] = []

	for (const path of paths) {
		let currentNode = tree
		const parts = path.split(":")
		for (const part of parts) {
			const existingNode = currentNode.find((node) => node.title === part)

			if (existingNode) {
				currentNode = existingNode.children
			} else {
				const nodePath = `/${parts
					.slice(0, parts.indexOf(part) + 1)
					.join("/")}`

				const node = {
					title: part,
					path: nodePath,
					children: []
				}
				currentNode.push(node)
				currentNode = node.children
			}
		}
	}

	return tree
}

const StorageContext = createContext<Storage>()

const StorageProvider = (props: { children: JSXElement }) => {
	const options = {
		repo: "seanvelasco/notes-storage",
		branch: "main",
		dir: "/"
	}

	const storage = createStorage({ driver: driver(options) })

	if (!storage) {
		throw new Error(
			`Failed to create storage, unable to connect to ${options.repo}`
		)
	}

	const [notes, setNotes] = createSignal<Node[]>([])

	const note = async () => {
		const location = useLocation()
		return storage.getItem(
			decodeURIComponent(location.pathname) + ALLOWED_FILES.MD
		) as Promise<string>
	}

	onMount(async () => {
		let notes = await storage.getKeys()
		notes = notes.filter((note) => note.endsWith(ALLOWED_FILES.MD))
		notes = notes.map((note) => note.replace(ALLOWED_FILES.MD, ""))
		setNotes(createDirectoryTree(notes))
	})

	return (
		<StorageContext.Provider
			value={{
				notes,
				note
			}}
		>
			{props.children}
		</StorageContext.Provider>
	)
}

const useStorage = () => {
	const storage = useContext(StorageContext!)

	if (!storage) {
		throw new Error("useStorage must be used within a StorageProvider")
	}

	return storage
}

export { StorageProvider, useStorage }
