import RoleController from '#controllers/role.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  Button,
  Checkbox,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft, IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import DashboardLayout from '~/layouts/dashboard'
import { checkForm } from '~/lib/utils'

const baseRoute = 'role'
const basePerm = 'role'
const title = 'Role'

export default function Page(
  props: SharedProps &
    (InferPageProps<RoleController, 'viewEdit'> | InferPageProps<RoleController, 'viewCreate'>)
) {
  const { data, permissions } = props
  const permissionsKey = Object.keys(permissions)
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: route('dashboard.view').path,
    },
    {
      title: title,
      href: route(`${basePerm}.index`).path,
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
      permissionIds: data && data.permissions?.length ? data.permissions.map((d) => d.id) : [],
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
    route(`${baseRoute}.${data ? 'update' : 'store'}`).path,
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
      <Head title={`${title} ` + (data ? 'Edit' : 'Create')} />
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
                  label="Role Name"
                  placeholder="Name..."
                  value={form.values.name}
                  error={form.errors.name}
                  disabled={mutation.isPending}
                  onChange={(e) => form.setFieldValue('name', e.target.value)}
                />

                {/* we create selections of available permissions */}
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                  {permissionsKey.map((permission, i) => (
                    <Paper p="md" shadow="md" radius="md" withBorder key={i}>
                      <Stack gap={'xs'}>
                        <Text>{permission}</Text>
                        {permissions[permission].map((perm: { id: number; name: string }, j) => (
                          <Checkbox
                            key={j}
                            label={perm.name}
                            checked={form.values.permissionIds?.includes(perm.id)}
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
                          />
                        ))}
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </DashboardLayout>
  )
}
