import PermissionController from '#controllers/permission.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Button, Grid, Group, Paper, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft, IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import DashboardLayout from '~/layouts/dashboard'
import { checkForm } from '~/lib/utils'

const baseRoute = 'permission'

export default function Page(
  props: SharedProps &
    (
      | InferPageProps<PermissionController, 'viewEdit'>
      | InferPageProps<PermissionController, 'viewCreate'>
    )
) {
  const { data } = props
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: route('dashboard.view').path,
    },
    {
      title: 'Permission',
      href: route('permission.index').path,
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
        console.log(parts)
        if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) return null
        return 'Format does not match. Correct Example: permission.view'
      },
    },
  })

  const mutation = useGenericMutation(
    data ? 'PATCH' : 'POST',
    route(`permission.${data ? 'update' : 'store'}`).path,
    {
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
      router.visit(route(`${baseRoute}.index`))
    },
    message: 'Are you sure you want to go back?',
    confirmText: 'Go Back',
    confirmVariant: 'destructive',
  })

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={'Permission ' + (data ? 'Edit' : 'Create')} />
      <div className="space-y-4">
        <Group>
          <Button
            variant="outline"
            style={{ width: 'fit-content' }}
            loading={mutation.isPending}
            leftSection={<IconArrowLeft size={16} />}
            color="gray"
            onClick={onBack}
          >
            Back
          </Button>
          <Group ms={'auto'} justify="flex-end">
            <Button
              variant="outline"
              style={{ width: 'fit-content' }}
              loading={mutation.isPending}
              leftSection={<IconCancel size={16} />}
              color="red"
              onClick={onReset}
            >
              {data ? 'Cancel Changes' : 'Reset'}
            </Button>
            <Button
              style={{ width: 'fit-content' }}
              loading={mutation.isPending}
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={onSave}
            >
              {data ? 'Save Changes' : 'Create'}
            </Button>
          </Group>
        </Group>

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
