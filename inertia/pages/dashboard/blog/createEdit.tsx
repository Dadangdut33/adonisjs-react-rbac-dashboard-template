import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { Button, Group, Paper, Tabs } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconExternalLink } from '@tabler/icons-react'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import MediaLibraryDialog from '~/components/RTE/media-library-dialog'
import { uploadImage } from '~/components/RTE/upload-service'
import DashboardFormActionBar from '~/components/core/dashboard/form-action-bar'
import LeavePageAfterSaveCheckbox from '~/components/core/form/leave-page-after-save-checkbox'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import DraftRestoreModal from '~/components/page-components/blog/draft-restore-modal'
import BlogEditorTab from '~/components/page-components/blog/editor-tab'
import BlogRollbackTab from '~/components/page-components/blog/rollback-tab'
import { Data } from '~/generated/data'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import { useLeavePageAfterSave } from '~/hooks/use_leave_page_after_save'
import DashboardLayout from '~/layouts/dashboard'
import { getBlogDraftStorageKey, useBlogEditorDraftStore } from '~/lib/blog_editor_draft'
import { urlFor } from '~/lib/client'
import { checkForm } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'blog'
const basePerm = 'blog'
const title = 'Blog'

type BlogFormValues = {
  id: string
  title: string
  is_active: boolean
  is_pinned: boolean
  thumbnail_id: string
  description: string
  tags: string[]
}

type BlogEditorSnapshot = {
  form: BlogFormValues
  content: Record<string, any>
  thumbnailPreviewUrl: string
}

const normalizeSnapshot = (state: BlogEditorSnapshot): BlogEditorSnapshot => ({
  form: {
    ...state.form,
    tags: [...(state.form.tags || [])],
  },
  content: state.content || { type: 'doc', content: [] },
  thumbnailPreviewUrl: state.thumbnailPreviewUrl || '',
})

const serializeSnapshot = (state: BlogEditorSnapshot) => JSON.stringify(normalizeSnapshot(state))

const buildServerSnapshot = (
  data: Data.Blog | null,
  defaultContent: Record<string, any>
): BlogEditorSnapshot => ({
  form: {
    id: data?.id || '',
    title: data?.title || '',
    is_active: data?.is_active ?? true,
    is_pinned: data?.is_pinned ?? false,
    thumbnail_id: data?.thumbnail_id || '',
    description: data?.description || '',
    tags: data?.tags?.map((tag) => tag.name) || [],
  },
  content: data?.content || defaultContent,
  thumbnailPreviewUrl: data?.thumbnail?.url || '',
})

const changedFieldsBetween = (server: BlogEditorSnapshot, local: BlogEditorSnapshot): string[] => {
  const changed: string[] = []

  if (server.form.title !== local.form.title) changed.push('title')
  if (server.form.description !== local.form.description) changed.push('description')
  if (server.form.is_active !== local.form.is_active) changed.push('is_active')
  if (server.form.is_pinned !== local.form.is_pinned) changed.push('is_pinned')
  if (server.form.thumbnail_id !== local.form.thumbnail_id) changed.push('thumbnail_id')
  if (JSON.stringify(server.form.tags) !== JSON.stringify(local.form.tags)) changed.push('tags')
  if (JSON.stringify(server.content) !== JSON.stringify(local.content)) changed.push('content')

  return changed
}

function formSafeTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractMediaIdFromRedirectUrl(value: string): string | null {
  if (!value) return null

  try {
    const parsed = new URL(value, window.location.origin)
    const match = parsed.pathname.match(/^\/api\/v1\/public\/media\/redirect\/([^/?#]+)$/)
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

type PageProps = InertiaProps<{
  data: Data.Blog | null
  availableTags: Data.Tag[]
}>

export default function Page(props: PageProps) {
  const { data, availableTags } = props
  const [leavePageAfterSave, setLeavePageAfterSave] = useLeavePageAfterSave(title)
  const defaultContent = { type: 'doc', content: [] }
  const [content, setContent] = useState<Record<string, any>>(data?.content || defaultContent)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>(data?.thumbnail?.url || '')
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'rollback'>(() => {
    if (typeof window === 'undefined') return 'editor'
    return window.location.search.includes('tab=rollback') && !!data ? 'rollback' : 'editor'
  })
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(
    data?.versions?.[0]?.id || null
  )
  const [selectedRollbackFields, setSelectedRollbackFields] = useState<string[]>([])
  const [editorContentVersion, setEditorContentVersion] = useState(0)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const tagSuggestions = (availableTags || []).map((tag) => tag.name)
  const draftKey = data?.id ? `blog:${data.id}` : `blog:new:${props.currentPath}`
  const draftStorageKey = getBlogDraftStorageKey(`user:${props.user?.id ?? 'guest'}:blog-editor`)
  const { getDraft, setDraft, clearDraft } = useBlogEditorDraftStore({
    storageKey: draftStorageKey,
  })
  const [isDirty, setIsDirty] = useState(false)
  const [restoreDraftModalOpen, setRestoreDraftModalOpen] = useState(false)
  const [draftServerSnapshot, setDraftServerSnapshot] = useState<BlogEditorSnapshot | null>(null)
  const [draftLocalSnapshot, setDraftLocalSnapshot] = useState<BlogEditorSnapshot | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const syncedSerializedRef = useRef('')
  const currentSerializedRef = useRef('')
  const hydratingRef = useRef(true)
  const bypassLeaveGuardRef = useRef(false)

  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: urlFor('dashboard.view'),
    },
    {
      title,
      href: urlFor(`${basePerm}.index`),
    },
    {
      title: data ? 'Edit' : 'Create',
      href: props.currentPath,
    },
  ]

  const { ConfirmAddModal, ConfirmModal, ConfirmResetModal } = useModals()

  const form = useForm<BlogFormValues>({
    initialValues: {
      id: data ? data.id : '',
      title: data ? data.title : '',
      is_active: data?.is_active ?? true,
      is_pinned: data?.is_pinned ?? false,
      thumbnail_id: data?.thumbnail_id || '',
      description: data?.description || '',
      tags: data?.tags?.map((tag) => tag.name) || [],
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Title is required'),
    },
  })

  const mutation = useGenericMutation(
    data ? 'PATCH' : 'POST',
    urlFor(`${baseRoute}.${data ? 'update' : 'store'}`),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      onSuccess: () => {
        clearDraft(draftKey)
        syncedSerializedRef.current = currentSerializedRef.current
        setIsDirty(false)
        form.reset()
      },
      doRedirect: data ? leavePageAfterSave : true,
    }
  )

  const refreshEditData = () => {
    if (!data?.id) return

    router.visit(`${urlFor(`${baseRoute}.edit`, { id: data.id })}?tab=${activeTab}`, {
      replace: true,
      preserveState: false,
      preserveScroll: true,
    })
  }

  const rollbackMutation = useGenericMutation('POST', urlFor('blog.rollback'), {
    doRedirect: false,
    onSuccess: refreshEditData,
  })

  const rollbackFieldsMutation = useGenericMutation('POST', urlFor('blog.rollbackFields'), {
    doRedirect: false,
    onSuccess: refreshEditData,
  })

  const onSave = ConfirmAddModal({
    onConfirm: () => {
      if (!checkForm(form)) return

      mutation.mutate({
        id: form.values.id || undefined,
        title: form.values.title,
        is_active: form.values.is_active,
        is_pinned: form.values.is_pinned,
        thumbnail_id: form.values.thumbnail_id ? form.values.thumbnail_id : null,
        description: form.values.description ? form.values.description : null,
        content,
        tags: Array.from(
          new Set(form.values.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))
        ),
      })
    },
  })

  const onReset = ConfirmResetModal({
    onConfirm: () => {
      const serverSnapshot = buildServerSnapshot(data, defaultContent)
      applySnapshot(serverSnapshot)
      clearDraft(draftKey)
      syncedSerializedRef.current = serializeSnapshot(serverSnapshot)
      setIsDirty(false)
      NotifyInfo('Form Reseted', 'Form has been reseted successfully')
    },
    name: 'Form',
  })

  const onBack = ConfirmModal({
    onConfirm: () => {
      bypassLeaveGuardRef.current = true
      router.visit(urlFor(`${baseRoute}.index`))
    },
    message: 'Are you sure you want to go back?',
    confirmText: 'Go Back',
    confirmVariant: 'destructive',
  })

  const setThumbnailFromUrl = (url: string) => {
    const mediaId = extractMediaIdFromRedirectUrl(url)
    if (!mediaId) {
      setThumbnailUploadError('Selected media URL is invalid.')
      return
    }

    form.setFieldValue('thumbnail_id', mediaId)
    setThumbnailPreviewUrl(url)
    setThumbnailUploadError(null)
  }

  const clearThumbnail = () => {
    form.setFieldValue('thumbnail_id', '')
    setThumbnailPreviewUrl('')
    setThumbnailUploadError(null)
  }

  const handleThumbnailFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setThumbnailUploadError(null)
    setIsUploadingThumbnail(true)
    try {
      const uploadedMedia = await uploadImage(file, urlFor('api.v1.media.upload'), ['blog-content'])
      form.setFieldValue('thumbnail_id', uploadedMedia.id)
      setThumbnailPreviewUrl(uploadedMedia.url)
    } catch (error) {
      setThumbnailUploadError(error instanceof Error ? error.message : 'Failed to upload thumbnail')
    } finally {
      setIsUploadingThumbnail(false)
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = ''
      }
    }
  }

  const currentSnapshot = useMemo<BlogEditorSnapshot>(
    () => ({
      form: {
        ...form.values,
        tags: [...form.values.tags],
      },
      content,
      thumbnailPreviewUrl,
    }),
    [form.values, content, thumbnailPreviewUrl]
  )

  const currentSerialized = useMemo(() => serializeSnapshot(currentSnapshot), [currentSnapshot])
  currentSerializedRef.current = currentSerialized

  const applySnapshot = (snapshot: BlogEditorSnapshot) => {
    const normalized = normalizeSnapshot(snapshot)
    form.setValues(normalized.form)
    setContent(normalized.content)
    setThumbnailPreviewUrl(normalized.thumbnailPreviewUrl)
    setThumbnailUploadError(null)
    setEditorContentVersion((version) => version + 1)
  }

  const hasPendingMutation =
    mutation.isPending || rollbackMutation.isPending || rollbackFieldsMutation.isPending

  const draftChangedFields = useMemo(() => {
    if (!draftServerSnapshot || !draftLocalSnapshot) return []
    return changedFieldsBetween(draftServerSnapshot, draftLocalSnapshot)
  }, [draftServerSnapshot, draftLocalSnapshot])

  const keepLocalDraft = () => {
    if (!draftLocalSnapshot || !draftServerSnapshot) return
    hydratingRef.current = true
    applySnapshot(draftLocalSnapshot)
    const serverSerialized = serializeSnapshot(draftServerSnapshot)
    syncedSerializedRef.current = serverSerialized
    setIsDirty(serializeSnapshot(draftLocalSnapshot) !== serverSerialized)
    setRestoreDraftModalOpen(false)
    setTimeout(() => {
      hydratingRef.current = false
    }, 0)
  }

  const keepServerVersion = () => {
    clearDraft(draftKey)
    setDraftLocalSnapshot(null)
    setDraftSavedAt(null)
    setRestoreDraftModalOpen(false)
  }

  const selectedRevision = data?.versions?.find((version) => version.id === selectedRevisionId)
  const currentTagsText = form.values.tags.join(', ')
  const currentContent = content
  const revisionContent = selectedRevision?.content || { type: 'doc', content: [] }
  const contentCurrentText = JSON.stringify(content, null, 2)
  const contentRevisionText = JSON.stringify(selectedRevision?.content || {}, null, 2)
  const revisionSelectData =
    data?.versions?.map((version) => ({
      value: version.id,
      label: `v${version.version} • ${new Date(version.created_at).toLocaleString()} • ${version.change_type}`,
    })) || []

  const onRollbackFull = () => {
    if (!data?.id || !selectedRevisionId) return

    rollbackMutation.mutate({
      id: data.id,
      revisionId: selectedRevisionId,
    })
  }

  const onRollbackFields = () => {
    if (!data?.id || !selectedRevisionId || selectedRollbackFields.length === 0) return

    rollbackFieldsMutation.mutate({
      id: data.id,
      revisionId: selectedRevisionId,
      fields: selectedRollbackFields,
    })
  }

  useEffect(() => {
    hydratingRef.current = true
    bypassLeaveGuardRef.current = false

    const serverSnapshot = buildServerSnapshot(data, defaultContent)
    applySnapshot(serverSnapshot)
    syncedSerializedRef.current = serializeSnapshot(serverSnapshot)
    currentSerializedRef.current = syncedSerializedRef.current
    setIsDirty(false)

    setThumbnailUploadError(null)
    setSelectedRevisionId(data?.versions?.[0]?.id || null)
    setSelectedRollbackFields([])

    const draft = getDraft(draftKey)
    if (draft) {
      const localSnapshot = normalizeSnapshot(draft.state)
      const localSerialized = serializeSnapshot(localSnapshot)

      if (localSerialized !== syncedSerializedRef.current) {
        setDraftServerSnapshot(serverSnapshot)
        setDraftLocalSnapshot(localSnapshot)
        setDraftSavedAt(draft.savedAt)
        setRestoreDraftModalOpen(true)
      } else {
        clearDraft(draftKey)
        setDraftServerSnapshot(null)
        setDraftLocalSnapshot(null)
        setDraftSavedAt(null)
        setRestoreDraftModalOpen(false)
      }
    } else {
      setDraftServerSnapshot(null)
      setDraftLocalSnapshot(null)
      setDraftSavedAt(null)
      setRestoreDraftModalOpen(false)
    }

    setTimeout(() => {
      hydratingRef.current = false
    }, 0)
  }, [data?.id, data?.updated_at, draftKey])

  useEffect(() => {
    if (hydratingRef.current) return
    setIsDirty(currentSerialized !== syncedSerializedRef.current)
  }, [currentSerialized])

  useEffect(() => {
    if (hydratingRef.current) return
    if (!draftKey) return
    if (restoreDraftModalOpen) return

    if (!isDirty) {
      clearDraft(draftKey)
      return
    }

    const timer = window.setTimeout(() => {
      setDraft(draftKey, currentSnapshot as any)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [draftKey, isDirty, currentSerialized, currentSnapshot, restoreDraftModalOpen])

  useEffect(() => {
    const shouldBlockLeave = () =>
      isDirty && !hasPendingMutation && !bypassLeaveGuardRef.current && !restoreDraftModalOpen

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockLeave()) return
      event.preventDefault()
      event.returnValue = ''
    }

    const removeBefore = router.on('before', () => {
      if (!shouldBlockLeave()) return
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      )
      if (!confirmed) return false
      bypassLeaveGuardRef.current = true
      return
    })

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      removeBefore()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, hasPendingMutation, restoreDraftModalOpen])

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={`${title} ` + (data ? 'Edit' : 'Create')} />
      <div className="space-y-4">
        <DashboardFormActionBar
          onBack={onBack}
          backLoading={
            mutation.isPending || rollbackMutation.isPending || rollbackFieldsMutation.isPending
          }
          beforeSecondaryActions={
            <>
              {activeTab === 'editor' && (
                <LeavePageAfterSaveCheckbox
                  checked={leavePageAfterSave}
                  onChange={setLeavePageAfterSave}
                  visible={!!data}
                  disabled={mutation.isPending}
                />
              )}
              {data?.url_path && (
                <Group justify="flex-end">
                  <Button
                    variant="outline"
                    color="teal"
                    component="a"
                    href={data.url_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftSection={<IconExternalLink size={16} />}
                  >
                    Open Post Preview
                  </Button>
                </Group>
              )}

              {activeTab !== 'editor' && (
                <>
                  <Button
                    color="yellow"
                    variant="outline"
                    loading={rollbackMutation.isPending}
                    disabled={!selectedRevisionId || rollbackFieldsMutation.isPending}
                    onClick={onRollbackFull}
                  >
                    Rollback Full Revision
                  </Button>
                  <Button
                    color="orange"
                    loading={rollbackFieldsMutation.isPending}
                    disabled={
                      !selectedRevisionId ||
                      selectedRollbackFields.length === 0 ||
                      rollbackMutation.isPending
                    }
                    onClick={onRollbackFields}
                  >
                    Rollback Selected Fields
                  </Button>
                </>
              )}
            </>
          }
          secondaryActionLabel={
            activeTab === 'editor' ? (data ? 'Cancel Changes' : 'Reset') : undefined
          }
          onSecondaryAction={activeTab === 'editor' ? onReset : undefined}
          secondaryActionLoading={mutation.isPending}
          primaryActionLabel={
            activeTab === 'editor' ? (data ? 'Save Changes' : 'Create') : undefined
          }
          onPrimaryAction={activeTab === 'editor' ? onSave : undefined}
          primaryActionLoading={mutation.isPending}
        />

        <Paper p="md" shadow="md" radius="md" withBorder>
          <Tabs value={activeTab} onChange={(value) => setActiveTab((value as any) || 'editor')}>
            <Tabs.List>
              <Tabs.Tab value="editor">Editor</Tabs.Tab>
              {data ? <Tabs.Tab value="rollback">Version Rollback</Tabs.Tab> : null}
            </Tabs.List>

            <Tabs.Panel value="editor" pt="md">
              <BlogEditorTab
                data={data ? { id: data.id, slug_id: data.slug_id } : null}
                form={form}
                mutationPending={mutation.isPending}
                isUploadingThumbnail={isUploadingThumbnail}
                thumbnailPreviewUrl={thumbnailPreviewUrl}
                thumbnailUploadError={thumbnailUploadError}
                thumbnailInputRef={thumbnailInputRef}
                tagSuggestions={tagSuggestions}
                content={content}
                editorContentVersion={editorContentVersion}
                onContentChange={setContent}
                onOpenMediaLibrary={() => setMediaLibraryOpen(true)}
                onThumbnailFileChange={handleThumbnailFileChange}
                onClearThumbnail={clearThumbnail}
                formSafeTitle={formSafeTitle}
              />
            </Tabs.Panel>

            {data ? (
              <Tabs.Panel value="rollback" pt="md">
                <BlogRollbackTab
                  selectedRevisionId={selectedRevisionId}
                  selectedRevision={selectedRevision}
                  selectedRollbackFields={selectedRollbackFields}
                  currentTitle={form.values.title}
                  currentIsActive={form.values.is_active}
                  currentIsPinned={form.values.is_pinned}
                  currentDescription={form.values.description || ''}
                  currentTagsText={currentTagsText}
                  currentContent={currentContent}
                  revisionContent={revisionContent}
                  contentCurrentText={contentCurrentText}
                  contentRevisionText={contentRevisionText}
                  revisionSelectData={revisionSelectData}
                  rollbackPending={rollbackMutation.isPending}
                  rollbackFieldsPending={rollbackFieldsMutation.isPending}
                  onSelectRevision={setSelectedRevisionId}
                  onChangeRollbackFields={setSelectedRollbackFields}
                  onRollbackFull={onRollbackFull}
                  onRollbackFields={onRollbackFields}
                />
              </Tabs.Panel>
            ) : null}
          </Tabs>
        </Paper>
      </div>

      <DraftRestoreModal
        opened={restoreDraftModalOpen}
        serverSnapshot={draftServerSnapshot}
        localSnapshot={draftLocalSnapshot}
        localSavedAt={draftSavedAt}
        changedFields={draftChangedFields}
        onKeepServerVersion={keepServerVersion}
        onKeepLocalDraft={keepLocalDraft}
      />

      <MediaLibraryDialog
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        pickerType="image"
        onSelectImage={setThumbnailFromUrl}
        getURL={urlFor('api.v1.media.list')}
        deleteURL={urlFor('api.v1.media.destroy')}
      />
    </DashboardLayout>
  )
}
