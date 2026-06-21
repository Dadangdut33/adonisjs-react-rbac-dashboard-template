import { useLocalStorage } from '@mantine/hooks'
import { useCallback } from 'react'

type BlogDraftFormValues = {
  id: string
  title: string
  is_active: boolean
  is_pinned: boolean
  thumbnail_id: string
  description: string
  tags: string[]
  projectIds: string[]
}

export type BlogEditorDraftState = {
  form: BlogDraftFormValues
  content: Record<string, any>
  thumbnailPreviewUrl: string
}

export type BlogEditorDraft = {
  key: string
  savedAt: string
  state: BlogEditorDraftState
}

type BlogEditorDraftStore = Record<string, BlogEditorDraft>

const DEFAULT_MAX_DRAFTS = 40
const STORAGE_NAMESPACE = 'blog-editor-drafts'
const STORAGE_VERSION = 'v1'

const safeParse = (raw: string | undefined): BlogEditorDraftStore => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as BlogEditorDraftStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const pruneDrafts = (store: BlogEditorDraftStore, maxDrafts: number): BlogEditorDraftStore => {
  const entries = Object.entries(store)
  if (entries.length <= maxDrafts) return store

  entries.sort((a, b) => {
    const aTs = new Date(a[1].savedAt).getTime() || 0
    const bTs = new Date(b[1].savedAt).getTime() || 0
    return bTs - aTs
  })

  const next: BlogEditorDraftStore = {}
  for (const [key, value] of entries.slice(0, maxDrafts)) {
    next[key] = value
  }

  return next
}

export const getBlogDraftStorageKey = (scope: string) =>
  `${STORAGE_NAMESPACE}:${STORAGE_VERSION}:${scope}`

type UseBlogEditorDraftStoreOptions = {
  storageKey: string
  maxDrafts?: number
}

export const useBlogEditorDraftStore = ({
  storageKey,
  maxDrafts = DEFAULT_MAX_DRAFTS,
}: UseBlogEditorDraftStoreOptions) => {
  const [store, setStore] = useLocalStorage<BlogEditorDraftStore>({
    key: storageKey,
    defaultValue: {},
    getInitialValueInEffect: false,
    deserialize: safeParse,
    serialize: (value) => JSON.stringify(value),
  })

  const getDraft = useCallback(
    (key: string): BlogEditorDraft | null => {
      if (!key) return null
      return store[key] || null
    },
    [store]
  )

  const setDraft = useCallback(
    (key: string, state: BlogEditorDraftState) => {
      if (!key) return
      setStore((current) => {
        const next = {
          ...current,
          [key]: {
            key,
            savedAt: new Date().toISOString(),
            state,
          },
        }
        return pruneDrafts(next, maxDrafts)
      })
    },
    [setStore, maxDrafts]
  )

  const clearDraft = useCallback(
    (key: string) => {
      if (!key) return
      setStore((current) => {
        if (!(key in current)) return current
        const next = { ...current }
        delete next[key]
        return next
      })
    },
    [setStore]
  )

  return {
    getDraft,
    setDraft,
    clearDraft,
  }
}
