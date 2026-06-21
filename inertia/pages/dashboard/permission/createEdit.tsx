import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { Grid, Paper, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
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

const baseRoute = 'permission'
const basePerm = 'permission'
const title = 'Permission'
type PageProps = InertiaProps<{
  data: Data.Permission | null
}>

export default function Page(props: PageProps) {
  const { data } = props
  const [leavePageAfterSave, setLeavePageAfterSave] = useLeavePageAfterSave(title)
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

  const form = useForm({
    initialValues: {
      id: data ? data?.id : '',
      name: data ? data?.name : '',
    },
    validate: {
      name: (value) => {
        if (!value) return 'Data is required'
        if (value.length < 1) return 'Data is required'

        // check if the permission is valid it must be like this
        // permission.what
        const parts = value.split('.')
        if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) return null
        return 'Format does not match. Correct Example: permission.view'
      },
    },
  })

  const mutation = useGenericMutation(
    data ? 'PATCH' : 'POST',
    urlFor(`${baseRoute}.${data ? 'update' : 'store'}`),
    {
      onSuccess: () => {
        form.reset()
      },
      doRedirect: data ? leavePageAfterSave : true,
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

        <Grid gutter={{ base: 'lg', lg: 'xl' }}>
          <Grid.Col span={{ base: 12 }}>
            <Paper p="md" shadow="md" radius="md" withBorder>
              <Stack>
                <TextInput
                  withAsterisk
                  label="Permission Name"
                  placeholder="Name..."
                  description="Format of permission name is category.action. Example: permission.view"
                  value={form.values.name}
                  error={form.errors.name}
                  disabled={mutation.isPending}
                  onChange={(e) => form.setFieldValue('name', e.target.value)}
                />
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </DashboardLayout>
  )
}
