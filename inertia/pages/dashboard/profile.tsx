import ProfileController from '#controllers/profile.controller'
import Role from '#models/role'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { FileButton, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useModals } from '~/components/core/modal/modal-hooks'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useAvatar } from '~/hooks/use_avatar'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import DashboardLayout from '~/layouts/dashboard'
import { checkForm } from '~/lib/utils'

export default function Profile(props: SharedProps & InferPageProps<ProfileController, 'view'>) {
  const { user, profile, roles = [] } = props
  const { ConfirmAddModal } = useModals()
  const avatar = useAvatar()

  const form = useForm({
    initialValues: {
      bio: profile?.bio || '',
      avatar: null as File | null,
    },
    validate: {
      bio: (value) => (value.length > 500 ? 'Maximum value is 500 characters' : null),
    },
  })

  const mutation = useGenericMutation('PATCH', route('profile.update').path, {
    onSuccess: () => {
      router.visit(route('profile.view').path)
    },
  })

  const onSave = ConfirmAddModal({
    onConfirm: () => {
      if (!checkForm(form)) return
      mutation.mutate(form.values)
    },
  })

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          title: 'Dashboard',
          href: route('dashboard.view').path,
        },
        {
          title: 'Profile',
          href: props.currentPath,
        },
      ]}
    >
      <Head title="Profile" />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account's profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email} disabled readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={user?.full_name} disabled readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  value={form.values.bio}
                  onChange={(e) => form.setFieldValue('bio', e.target.value)}
                  autosize
                  minRows={2}
                  maxRows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roles">Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role: Role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>Update your profile picture. Max size is 2MB.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatar} alt={user?.full_name} />
                  <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <FileButton
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(file) => {
                        if (file) {
                          form.setFieldValue('avatar', file)
                        }
                      }}
                    >
                      {(props) => (
                        <Button variant="outline" type="button" {...props}>
                          Change Avatar
                        </Button>
                      )}
                    </FileButton>
                  </Label>
                  {form.values.avatar && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {form.values.avatar.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={onSave} disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
