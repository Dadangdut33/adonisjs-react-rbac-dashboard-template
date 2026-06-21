import {
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import TiptapEditor from '~/components/RTE'

type BlogDraftFormValues = {
  id: string
  title: string
  is_active: boolean
  is_pinned: boolean
  thumbnail_id: string
  description: string
  tags: string[]
}

export type BlogDraftSnapshot = {
  form: BlogDraftFormValues
  content: Record<string, any>
  thumbnailPreviewUrl: string
}

type SnapshotPreviewPanelProps = {
  label: string
  snapshot: BlogDraftSnapshot | null
  viewMode: 'rendered' | 'json'
}

function SnapshotPreviewPanel({ label, snapshot, viewMode }: SnapshotPreviewPanelProps) {
  return (
    <Paper withBorder p="sm" radius="md" className="min-w-0">
      <Text size="sm" fw={600} mb={6}>
        {label}
      </Text>
      <ScrollArea.Autosize mah={360} offsetScrollbars="y" type="auto">
        {!snapshot ? (
          <Text size="xs" c="dimmed">
            No data
          </Text>
        ) : viewMode === 'json' ? (
          <pre className="whitespace-pre-wrap break-words text-xs">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        ) : (
          <Stack gap="sm">
            <div>
              <Text size="xs" c="dimmed">
                Title
              </Text>
              <Text size="sm" fw={600}>
                {snapshot.form.title || 'Untitled'}
              </Text>
            </div>

            <Group gap={6}>
              <Badge color={snapshot.form.is_active ? 'green' : 'gray'} variant="light">
                {snapshot.form.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge color={snapshot.form.is_pinned ? 'yellow' : 'gray'} variant="light">
                {snapshot.form.is_pinned ? 'Pinned' : 'Not Pinned'}
              </Badge>
            </Group>

            {snapshot.thumbnailPreviewUrl ? (
              <img
                src={snapshot.thumbnailPreviewUrl}
                alt={`${label} thumbnail`}
                className="h-24 w-full rounded-md border object-cover"
              />
            ) : null}

            {snapshot.form.description ? (
              <div>
                <Text size="xs" c="dimmed">
                  Description
                </Text>
                <Text size="sm">{snapshot.form.description}</Text>
              </div>
            ) : null}

            {snapshot.form.tags.length > 0 ? (
              <div>
                <Text size="xs" c="dimmed" mb={4}>
                  Tags
                </Text>
                <Group gap={6}>
                  {snapshot.form.tags.map((tag) => (
                    <Badge key={`${label}-tag-${tag}`} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </div>
            ) : null}

            <Divider />

            <div>
              <Text size="xs" c="dimmed" mb={6}>
                Rendered Content
              </Text>
              <div className="max-h-[280px] overflow-auto rounded-md border bg-background p-2">
                <TiptapEditor
                  content={snapshot.content}
                  readOnly
                  stickyToolbar={false}
                  ssr={false}
                  className="border-0"
                />
              </div>
            </div>
          </Stack>
        )}
      </ScrollArea.Autosize>
    </Paper>
  )
}

type DraftRestoreModalProps = {
  opened: boolean
  serverSnapshot: BlogDraftSnapshot | null
  localSnapshot: BlogDraftSnapshot | null
  localSavedAt?: string | null
  changedFields: string[]
  onKeepServerVersion: () => void
  onKeepLocalDraft: () => void
}

export default function DraftRestoreModal({
  opened,
  serverSnapshot,
  localSnapshot,
  localSavedAt,
  changedFields,
  onKeepServerVersion,
  onKeepLocalDraft,
}: DraftRestoreModalProps) {
  const [viewMode, setViewMode] = useState<'rendered' | 'json'>('rendered')

  useEffect(() => {
    if (!opened) return
    setViewMode('rendered')
  }, [opened])

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      closeOnEscape={false}
      closeOnClickOutside={false}
      withCloseButton={false}
      title="Unsaved Local Draft Found"
      size="min(1200px, calc(100vw - 2rem))"
      xOffset="1rem"
      yOffset="4dvh"
      styles={{
        content: { overflow: 'hidden' },
        body: { overflow: 'hidden' },
      }}
    >
      <Stack gap="sm" className="min-w-0">
        <Text size="sm" c="dimmed">
          A local draft for this post exists and differs from server data. Choose which version you
          want to continue with.
        </Text>

        {localSnapshot ? (
          <Text size="xs" c="dimmed">
            Local draft saved at: {new Date(localSavedAt || '').toLocaleString()}
          </Text>
        ) : null}

        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Group gap={6}>
            <Text size="xs" fw={600}>
              Changed fields:
            </Text>
            <Text size="xs" c="dimmed">
              {changedFields.length > 0 ? changedFields.join(', ') : 'None'}
            </Text>
          </Group>

          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as 'rendered' | 'json')}
            data={[
              { label: 'Rendered', value: 'rendered' },
              { label: 'JSON', value: 'json' },
            ]}
            size="xs"
          />
        </Group>

        <Divider />

        <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
          <SnapshotPreviewPanel label="Server" snapshot={serverSnapshot} viewMode={viewMode} />
          <SnapshotPreviewPanel label="Local Draft" snapshot={localSnapshot} viewMode={viewMode} />
        </div>

        <Group justify="flex-end" wrap="wrap">
          <Button variant="outline" color="gray" onClick={onKeepServerVersion}>
            Keep Server Version
          </Button>
          <Button onClick={onKeepLocalDraft}>Use Local Draft</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
