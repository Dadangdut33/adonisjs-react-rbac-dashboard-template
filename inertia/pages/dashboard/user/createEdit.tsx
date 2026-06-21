import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import {
  Accordion,
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Fieldset,
  FileButton,
  Grid,
  MultiSelect,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
  rem,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  IconCloudUpload,
  IconPhoto,
  IconRefresh,
  IconTrash,
  IconUserPin,
} from '@tabler/icons-react'
import { useState } from 'react'
import {
  PasswordPopover,
  PasswordStrengthDropdown,
  getPasswordStrength,
} from '~/components/auth/password'
import DashboardFormActionBar from '~/components/core/dashboard/form-action-bar'
import LeavePageAfterSaveCheckbox from '~/components/core/form/leave-page-after-save-checkbox'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyInfo } from '~/components/core/notify'
import { Data } from '~/generated/data'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import { useLeavePageAfterSave } from '~/hooks/use_leave_page_after_save'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { PASS_REGEX } from '~/lib/constants'
import { checkForm, getImagePreviewURL, transformFullName, transformUsername } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'user'
const basePerm = 'user'
const title = 'User'

type PageProps = InertiaProps<{
  data: Data.User | null
  roles: Data.Role[]
}>

export default function Page(props: PageProps) {
  const { data, roles } = props
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
  const editingOwnAccount = data?.id === props.user?.id
  const mustNotTakenoffByOwnAccount = ['Admin', 'Super Admin']
  const currentRoleNames = data?.roles?.map((role) => role.name)
  const roleSelections = roles.map((role) => {
    // disable if already selected and editing own account
    // so that super admin cannot take off their own super admin access
    const disabled =
      editingOwnAccount &&
      mustNotTakenoffByOwnAccount.includes(role.name) &&
      currentRoleNames?.includes(role.name)

    return { value: `${role.id}`, label: role.name, disabled }
  })
  const { ConfirmAddModal, ConfirmModal, ConfirmResetModal } = useModals()

  const form = useForm({
    initialValues: {
      id: data ? data?.id : '',
      username: data ? data?.username : '',
      full_name: data ? data?.full_name : '',
      email: data ? data?.email : '',
      password: '',
      password_confirmation: '',
      is_email_verified: data ? data?.is_email_verified : false,
      roleIds: data && data.roles?.length ? data.roles.map((d) => d.id) : [],
      avatar: null as File | null,
      avatar_clear: false,
    },
    validate: {
      full_name: (value) => (value.length > 0 ? null : 'FullName is required'),
      username: (value) => (value.length > 0 ? null : 'Username is required'),
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      password: (value) =>
        value ? (PASS_REGEX.test(value) ? null : 'Password does not meet requirements') : null,
      password_confirmation: (value) => {
        if (!form.values.password && !value) return null
        if (form.values.password && !value) return 'Password confirmation is required'
        if (!PASS_REGEX.test(value)) return 'Password does not meet requirements'
        if (value !== form.values.password) return 'Passwords do not match'
        return null
      },
      roleIds: (value) => (value.length > 0 ? null : 'Role is required'),
    },
  })
  const avatarPreview = getImagePreviewURL(form.values.avatar, data?.profile?.avatarUrl)
  const avatarIsSet = avatarPreview || form.values.avatar

  // ---------------------------
  // Password strength
  const [openPW, setOpenPW] = useState(false)
  const [openPWConfirm, setOpenPWConfirm] = useState(false)

  const password = form.values.password
  const confirmation = form.values.password_confirmation
  const confirmationMatch = password === confirmation

  const strengthPass = getPasswordStrength(password, confirmationMatch, false)
  const strengthPassConfirm = getPasswordStrength(confirmation, confirmationMatch, true)

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

  const generateRandomPasswordMutation = useGenericMutation(
    'GET',
    urlFor('api.v1.utils.random-password'),
    {
      onSuccess: (data) => {
        form.setFieldValue('password', data.data)
        form.setFieldValue('password_confirmation', data.data)
      },
      notifySuccess: false,
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

  const handleAvatarClear = () => {
    form.setFieldValue('avatar_clear', true)
    form.setFieldValue('avatar', null)
  }

  const handleAvatarUpload = (file: File | null) => {
    if (!file) return
    form.setFieldValue('avatar', file)
    form.setFieldValue('avatar_clear', false)
  }

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
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper p="md" shadow="md" radius="md" h="100%" withBorder>
              <Stack gap={32}>
                <Fieldset legend="Account Information">
                  <Stack>
                    {data && (
                      <TextInput
                        withAsterisk
                        label="ID"
                        placeholder="id"
                        value={data.id}
                        disabled={true}
                        readOnly
                      />
                    )}
                    <TextInput
                      withAsterisk
                      label="Username"
                      placeholder="Username"
                      value={form.values.username}
                      error={form.errors.username}
                      disabled={mutation.isPending}
                      onChange={(e) =>
                        form.setFieldValue('username', transformUsername(e.target.value))
                      }
                      onBlur={() => form.setFieldValue('username', form.values.username.trim())}
                    />
                    <TextInput
                      withAsterisk
                      label="Full Name"
                      placeholder="Full Name"
                      value={form.values.full_name}
                      error={form.errors.name}
                      disabled={mutation.isPending}
                      onChange={(e) =>
                        form.setFieldValue('full_name', transformFullName(e.target.value))
                      }
                      onBlur={() => form.setFieldValue('full_name', form.values.full_name.trim())}
                    />
                    <TextInput
                      withAsterisk
                      type="email"
                      label="Email"
                      placeholder="Email"
                      value={form.values.email}
                      error={form.errors.email}
                      disabled={mutation.isPending}
                      onChange={(e) => form.setFieldValue('email', e.target.value)}
                    />
                    <Tooltip label="Mark email as verified" withArrow>
                      <Checkbox
                        label="Email Is Verified"
                        checked={form.values.is_email_verified}
                        disabled={mutation.isPending}
                        error={form.errors.is_email_verified}
                        onChange={(e) =>
                          form.setFieldValue('is_email_verified', e.currentTarget.checked)
                        }
                      />
                    </Tooltip>
                  </Stack>
                </Fieldset>
                <Fieldset legend="Password & Security">
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <PasswordPopover
                      input={
                        <PasswordInput
                          label="Password"
                          id="password"
                          type="password"
                          placeholder="******"
                          required
                          value={form.values.password}
                          error={form.errors.password}
                          onChange={(e) => form.setFieldValue('password', e.target.value)}
                        />
                      }
                      popoverOpened={openPW}
                      setPopoverOpened={setOpenPW}
                      popoverDropdown={
                        <PasswordStrengthDropdown
                          strength={strengthPass}
                          password={password}
                          confirmation={confirmation}
                        />
                      }
                    />

                    <Grid>
                      <Grid.Col span={11}>
                        <PasswordPopover
                          input={
                            <PasswordInput
                              label="Password Confirmation"
                              id="password_confirmation"
                              type="password"
                              placeholder="******"
                              required
                              value={form.values.password_confirmation}
                              error={form.errors.password_confirmation}
                              onChange={(e) =>
                                form.setFieldValue('password_confirmation', e.target.value)
                              }
                            />
                          }
                          popoverOpened={openPWConfirm}
                          setPopoverOpened={setOpenPWConfirm}
                          popoverDropdown={
                            <PasswordStrengthDropdown
                              strength={strengthPassConfirm}
                              password={password}
                              confirmation={confirmation}
                              isConfirmation
                            />
                          }
                        />
                      </Grid.Col>
                      <Grid.Col span={1} mt={'auto'}>
                        {/* button to random generate */}
                        <Tooltip label="Generate Random Password" position="top" withArrow>
                          <ActionIcon
                            onClick={() => generateRandomPasswordMutation.mutate(null)}
                            disabled={generateRandomPasswordMutation.isPending}
                            loading={generateRandomPasswordMutation.isPending}
                            variant="outline"
                            size={'input-sm'}
                          >
                            <IconRefresh size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Grid.Col>
                    </Grid>
                  </SimpleGrid>
                </Fieldset>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }} h="100%">
            <Paper p="md" shadow="md" radius="md" h="100%" withBorder>
              <Stack justify="space-between" gap={16} h="100%">
                <Accordion variant="contained" defaultValue={['featuredImage', 'Role']} multiple>
                  <Accordion.Item value="featuredImage">
                    <Accordion.Control
                      icon={
                        <IconPhoto
                          style={{
                            color: 'var(--mantine-color-red-6',
                            width: rem(20),
                            height: rem(20),
                          }}
                        />
                      }
                    >
                      Avatar
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack justify="center" align="center">
                        <Avatar
                          size={'100%'}
                          variant="filled"
                          radius="sm"
                          src={form.values.avatar_clear ? undefined : avatarPreview}
                        />
                        {form.errors.avatar && (
                          <Text size="xs" c="red" ta="center">
                            {form.errors.avatar}
                          </Text>
                        )}
                        <Grid gutter={12} justify="center">
                          <Grid.Col span={avatarIsSet ? 8 : 12}>
                            <FileButton onChange={handleAvatarUpload} accept="image/png,image/jpeg">
                              {(props) => (
                                <Button
                                  {...props}
                                  variant="subtle"
                                  leftSection={<IconCloudUpload size={16} />}
                                >
                                  Upload image
                                </Button>
                              )}
                            </FileButton>
                          </Grid.Col>

                          {avatarIsSet && (
                            <Grid.Col span={4}>
                              <Button onClick={handleAvatarClear} variant="subtle" color="red">
                                <IconTrash size={16} />
                              </Button>
                            </Grid.Col>
                          )}
                        </Grid>
                        <Text ta="center" size="xs" c="dimmed">
                          Max size 3MB.
                        </Text>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="Role">
                    <Accordion.Control
                      icon={
                        <IconUserPin
                          style={{
                            color: 'var(--mantine-color-green-6',
                            width: rem(20),
                            height: rem(20),
                          }}
                        />
                      }
                    >
                      Role
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack>
                        <MultiSelect
                          label="Role"
                          placeholder="Select User Role"
                          value={form.values.roleIds.map((t) => t.toString())}
                          error={form.errors.roleIds}
                          disabled={mutation.isPending}
                          checkIconPosition="right"
                          data={roleSelections}
                          onChange={(t) => {
                            const val = t.map((t) => parseInt(t))
                            form.setFieldValue('roleIds', val)
                          }}
                          multiple={true}
                          required
                          searchable
                        />
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </DashboardLayout>
  )
}
