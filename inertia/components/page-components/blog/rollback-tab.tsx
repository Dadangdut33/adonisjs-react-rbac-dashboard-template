import { Badge, Button, Checkbox, Divider, Group, Paper, Select, Stack, Switch, Text, Textarea } from '@mantine/core'
import { useState } from 'react'
import TiptapEditor from '~/components/RTE'

type BlogTag = { id: string; name: string }
type BlogVersion = {
  id: string
  version: number
  change_type: 'create' | 'update'
  title: string
  is_active: boolean
  is_pinned: boolean
  description: string | null
  content: Record<string, any>
  tags?: BlogTag[]
  changed_fields: string[] | null
  created_at: string
}

type RollbackField =
  | 'title'
  | 'is_active'
  | 'is_pinned'
  | 'thumbnail_id'
  | 'description'
  | 'content'
  | 'tags'

type Props = {
  selectedRevisionId: string | null
  selectedRevision: BlogVersion | undefined
  selectedRollbackFields: string[]
  currentTitle: string
  currentIsActive: boolean
  currentIsPinned: boolean
  currentDescription: string
  currentTagsText: string
  currentContent: Record<string, any>
  revisionContent: Record<string, any>
  contentCurrentText: string
  contentRevisionText: string
  revisionSelectData: { value: string; label: string }[]
  rollbackPending: boolean
  rollbackFieldsPending: boolean
  onSelectRevision: (id: string | null) => void
  onChangeRollbackFields: (fields: string[]) => void
  onRollbackFull: () => void
  onRollbackFields: () => void
}

const rollbackFieldOptions: { value: RollbackField; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'is_active', label: 'Active' },
  { value: 'is_pinned', label: 'Pinned' },
  { value: 'thumbnail_id', label: 'Thumbnail' },
  { value: 'description', label: 'Description' },
  { value: 'content', label: 'Content' },
  { value: 'tags', label: 'Tags' },
]

export default function BlogRollbackTab({
  selectedRevisionId,
  selectedRevision,
  selectedRollbackFields,
  currentTitle,
  currentIsActive,
  currentIsPinned,
  currentDescription,
  currentTagsText,
  currentContent,
  revisionContent,
  contentCurrentText,
  contentRevisionText,
  revisionSelectData,
  rollbackPending,
  rollbackFieldsPending,
  onSelectRevision,
  onChangeRollbackFields,
  onRollbackFull,
  onRollbackFields,
}: Props) {
  const [showRenderedContent, setShowRenderedContent] = useState(false)
  const selectedRevisionTagsText = selectedRevision?.tags?.map((tag) => tag.name).join(', ') || ''

  return (
    <Paper withBorder radius="md" p="md">
      <Stack>
        <Text size="sm" fw={600}>
          Version History & Rollback
        </Text>
        <Text size="xs" c="dimmed">
          Roll back fully, or only selected fields. Preview below shows current vs selected revision.
        </Text>

        <Select
          label="Select Revision"
          placeholder="Choose revision"
          data={revisionSelectData}
          value={selectedRevisionId}
          onChange={onSelectRevision}
          disabled={rollbackPending || rollbackFieldsPending}
          searchable
        />

        {selectedRevision ? (
          <>
            <Group gap={8}>
              <Text size="xs" fw={600}>
                Changed in this revision:
              </Text>
              {selectedRevision.changed_fields?.length ? (
                selectedRevision.changed_fields.map((field) => (
                  <Badge key={field} variant="light">
                    {field}
                  </Badge>
                ))
              ) : (
                <Text size="xs" c="dimmed">
                  -
                </Text>
              )}
            </Group>

            <Divider />

            <Stack gap={8}>
              <Text size="sm" fw={500}>
                Rollback Selected Fields
              </Text>
              <Group gap={10}>
                {rollbackFieldOptions.map((item) => (
                  <Checkbox
                    key={item.value}
                    label={item.label}
                    checked={selectedRollbackFields.includes(item.value)}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        onChangeRollbackFields([...selectedRollbackFields, item.value])
                      } else {
                        onChangeRollbackFields(
                          selectedRollbackFields.filter((value) => value !== item.value)
                        )
                      }
                    }}
                  />
                ))}
              </Group>
            </Stack>

            <Group>
              <Button
                color="yellow"
                variant="outline"
                onClick={onRollbackFull}
                loading={rollbackPending}
                disabled={!selectedRevisionId || rollbackFieldsPending}
              >
                Rollback Full Revision
              </Button>
              <Button
                color="orange"
                onClick={onRollbackFields}
                loading={rollbackFieldsPending}
                disabled={
                  !selectedRevisionId || selectedRollbackFields.length === 0 || rollbackPending
                }
              >
                Rollback Selected Fields
              </Button>
            </Group>

            <Divider />

            <Text size="sm" fw={500}>
              Difference Preview
            </Text>

            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                Toggle content preview mode
              </Text>
              <Switch
                label="Rendered Content"
                checked={showRenderedContent}
                onChange={(event) => setShowRenderedContent(event.currentTarget.checked)}
              />
            </Group>

            <Group grow align="flex-start">
              <Stack>
                <Text size="xs" fw={600}>
                  Title (Current)
                </Text>
                <Textarea value={currentTitle} readOnly autosize minRows={2} maxRows={4} />
              </Stack>
              <Stack>
                <Text size="xs" fw={600}>
                  Title (Revision)
                </Text>
                <Textarea value={selectedRevision.title} readOnly autosize minRows={2} maxRows={4} />
              </Stack>
            </Group>

            <Group grow align="flex-start">
              <Stack>
                <Text size="xs" fw={600}>
                  Description (Current)
                </Text>
                <Textarea value={currentDescription} readOnly autosize minRows={2} maxRows={6} />
              </Stack>
              <Stack>
                <Text size="xs" fw={600}>
                  Description (Revision)
                </Text>
                <Textarea
                  value={selectedRevision.description || ''}
                  readOnly
                  autosize
                  minRows={2}
                  maxRows={6}
                />
              </Stack>
            </Group>

            <Group grow align="flex-start">
              <Stack>
                <Text size="xs" fw={600}>
                  Active (Current)
                </Text>
                <Textarea value={currentIsActive ? 'Yes' : 'No'} readOnly autosize minRows={2} maxRows={2} />
              </Stack>
              <Stack>
                <Text size="xs" fw={600}>
                  Active (Revision)
                </Text>
                <Textarea
                  value={selectedRevision.is_active ? 'Yes' : 'No'}
                  readOnly
                  autosize
                  minRows={2}
                  maxRows={2}
                />
              </Stack>
            </Group>

            <Group grow align="flex-start">
              <Stack>
                <Text size="xs" fw={600}>
                  Pinned (Current)
                </Text>
                <Textarea value={currentIsPinned ? 'Yes' : 'No'} readOnly autosize minRows={2} maxRows={2} />
              </Stack>
              <Stack>
                <Text size="xs" fw={600}>
                  Pinned (Revision)
                </Text>
                <Textarea
                  value={selectedRevision.is_pinned ? 'Yes' : 'No'}
                  readOnly
                  autosize
                  minRows={2}
                  maxRows={2}
                />
              </Stack>
            </Group>

            <Group grow align="flex-start">
              <Stack>
                <Text size="xs" fw={600}>
                  Tags (Current)
                </Text>
                <Textarea value={currentTagsText} readOnly autosize minRows={2} maxRows={4} />
              </Stack>
              <Stack>
                <Text size="xs" fw={600}>
                  Tags (Revision)
                </Text>
                <Textarea
                  value={selectedRevisionTagsText}
                  readOnly
                  autosize
                  minRows={2}
                  maxRows={4}
                />
              </Stack>
            </Group>

            {showRenderedContent ? (
              <Group grow align="flex-start">
                <Stack>
                  <Text size="xs" fw={600}>
                    Content Preview (Current)
                  </Text>
                  <Paper withBorder radius="md" p="sm">
                    <TiptapEditor
                      key={`rollback-current-${contentCurrentText.length}`}
                      content={currentContent || { type: 'doc', content: [] }}
                      readOnly
                      ssr
                    />
                  </Paper>
                </Stack>
                <Stack>
                  <Text size="xs" fw={600}>
                    Content Preview (Revision)
                  </Text>
                  <Paper withBorder radius="md" p="sm">
                    <TiptapEditor
                      key={`rollback-revision-${selectedRevision?.id || 'none'}-${contentRevisionText.length}`}
                      content={revisionContent || { type: 'doc', content: [] }}
                      readOnly
                      ssr
                    />
                  </Paper>
                </Stack>
              </Group>
            ) : (
              <Group grow align="flex-start">
                <Stack>
                  <Text size="xs" fw={600}>
                    Content JSON (Current)
                  </Text>
                  <Textarea value={contentCurrentText} readOnly autosize minRows={6} maxRows={12} />
                </Stack>
                <Stack>
                  <Text size="xs" fw={600}>
                    Content JSON (Revision)
                  </Text>
                  <Textarea value={contentRevisionText} readOnly autosize minRows={6} maxRows={12} />
                </Stack>
              </Group>
            )}
          </>
        ) : (
          <Text size="sm" c="dimmed">
            No revision selected.
          </Text>
        )}
      </Stack>
    </Paper>
  )
}
