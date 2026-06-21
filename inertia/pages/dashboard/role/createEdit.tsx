import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { Alert, Checkbox, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import DashboardFormActionBar from '~/components/core/dashboard/form-action-bar'
import LeavePageAfterSaveCheckbox from '~/components/core/form/leave-page-after-save-checkbox'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { Data } from '~/generated/data'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import { useLeavePageAfterSave } from '~/hooks/use_leave_page_after_save'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { checkForm } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'role'
const basePerm = 'role'
const title = 'Role'
type PageProps = InertiaProps<{
  data: Data.Role | null
  permissions: Record<string, Data.Permission[]>
  mediaTags: Data.Tag[]
}>

export default function Page(props: PageProps) {
  const { data, permissions, mediaTags = [] } = props
  const [leavePageAfterSave, setLeavePageAfterSave] = useLeavePageAfterSave(title)
  const permissionsKey = Object.keys(permissions)
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: urlFor('dashboard.view'),
    },
    {
      title: title,
      href: urlFor(`${basePerm}.index`),
    },
    {
      title: data ? 'Edit' : 'Create',
      href: props.currentPath,
    },
  ]

  const { ConfirmAddModal, ConfirmModal, ConfirmResetModal } = useModals()
  // special check. For super admin role
  const isEditingSuperAdminRole = data?.name === 'Super Admin'
  const criticalPermissionPrefixes = ['role', 'permission', 'user']

  const form = useForm({
    initialValues: {
      id: data ? data?.id : '',
      name: data ? data?.name : '',
      permissionIds: data && data.permissions?.length ? data.permissions.map((d) => d.id) : [],
      mediaTagIds: data && data.media_tags?.length ? data.media_tags.map((d) => d.id) : [],
      can_access_all_media_tags: data ? data.can_access_all_media_tags : false,
    },
    validate: {
      name: (value) => {
        if (!value) return 'Data is required'
        if (value.length < 1) return 'Data is required'
        return null
      },
    },
  })

  const mutation = useGenericMutation(
    data ? 'PATCH' : 'POST',
    urlFor(`${baseRoute}.${data ? 'update' : 'store'}`),
    {
      doRedirect: data ? leavePageAfterSave : true,
      onSuccess: () => {
        form.reset()
      },
    }
  )

  const onSave = ConfirmAddModal({
    onConfirm: () => {
      if (!checkForm(form)) return
      mutation.mutate(form.values)
    },
  })

  const onReset = ConfirmResetModal({
    onConfirm: () => {
      form.reset()
      NotifyInfo('Form Reseted', 'Form has been reseted successfully')
    },
    name: 'Form',
  })

  const onBack = ConfirmModal({
    onConfirm: () => {
      router.visit(urlFor(`${baseRoute}.index`))
    },
    message: 'Are you sure you want to go back?',
    confirmText: 'Go Back',
    confirmVariant: 'destructive',
  })

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={`${title} ` + (data ? 'Edit' : 'Create')} />
      <div className="space-y-4">
        <DashboardFormActionBar
          onBack={onBack}
          backLoading={mutation.isPending}
          beforeSecondaryActions={
            <LeavePageAfterSaveCheckbox
              checked={leavePageAfterSave}
              onChange={setLeavePageAfterSave}
              visible={!!data}
              disabled={mutation.isPending}
            />
          }
          secondaryActionLabel={data ? 'Cancel Changes' : 'Reset'}
          onSecondaryAction={onReset}
          secondaryActionLoading={mutation.isPending}
          primaryActionLabel={data ? 'Save Changes' : 'Create'}
          onPrimaryAction={onSave}
          primaryActionLoading={mutation.isPending}
        />

        {isEditingSuperAdminRole && (
          <Alert icon={<IconAlertCircle />} title="Notice" color="yellow">
            Some critical permissions are required for Super Admin role and cannot be modified.
          </Alert>
        )}

        {data?.is_protected && (
          <Alert icon={<IconAlertCircle />} title="Notice" color="blue">
            Protected data cannot have its name changed.
          </Alert>
        )}

        <Paper p="md" shadow="md" radius="md" withBorder className="overflow-x-hidden">
          <Stack>
            <TextInput
              withAsterisk
              label="Role Name"
              placeholder="Name..."
              value={form.values.name}
              error={form.errors.name}
              disabled={mutation.isPending || data?.is_protected}
              onChange={(e) => form.setFieldValue('name', e.target.value)}
            />

            {/* we create selections of available permissions */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
              {permissionsKey.map((permission, i) => (
                <Paper p="md" shadow="md" radius="md" withBorder key={i}>
                  <Stack gap={'xs'}>
                    <Text>{permission}</Text>
                    {permissions[permission].map((perm, j) => {
                      const isCriticalPermission = criticalPermissionPrefixes.some((prefix) =>
                        perm.name.toLowerCase().startsWith(prefix)
                      )
                      return (
                        <Checkbox
                          key={j}
                          label={perm.name}
                          checked={
                            // force true if editing super admin and is critical permission
                            isEditingSuperAdminRole && isCriticalPermission
                              ? true
                              : form.values.permissionIds?.includes(perm.id)
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setFieldValue('permissionIds', [
                                ...form.values.permissionIds!,
                                perm.id,
                              ])
                            } else {
                              form.setFieldValue(
                                'permissionIds',
                                form.values.permissionIds?.filter((id) => id !== perm.id)
                              )
                            }
                          }}
                          disabled={
                            mutation.isPending ||
                            // we must make sure that super admin have access to these critical permissions
                            (isEditingSuperAdminRole && isCriticalPermission)
                          }
                        />
                      )
                    })}
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>

            <Paper p="md" shadow="md" radius="md" withBorder component={Stack} gap={'xs'}>
              <Text>Media Access</Text>
              <Checkbox
                label="Access All Media Tags (Wildcard)"
                description="If checked, this role can access all media regardless of tag selections."
                checked={form.values.can_access_all_media_tags}
                onChange={(e) => form.setFieldValue('can_access_all_media_tags', e.target.checked)}
                disabled={mutation.isPending}
              />

              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                {mediaTags.map((tag) => (
                  <Checkbox
                    key={tag.id}
                    label={tag.name}
                    checked={form.values.mediaTagIds?.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        form.setFieldValue('mediaTagIds', [...form.values.mediaTagIds!, tag.id])
                      } else {
                        form.setFieldValue(
                          'mediaTagIds',
                          form.values.mediaTagIds?.filter((id) => id !== tag.id)
                        )
                      }
                    }}
                    disabled={mutation.isPending || form.values.can_access_all_media_tags}
                  />
                ))}
              </SimpleGrid>
            </Paper>
          </Stack>
        </Paper>
      </div>
    </DashboardLayout>
  )
}
