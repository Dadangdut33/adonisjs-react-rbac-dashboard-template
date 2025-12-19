'use client'

import { Head } from '@inertiajs/react'
import { Center, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Lock } from 'lucide-react'
import { useEffect } from 'react'

import ButtonGroup from './button_group'
import classes from './error.module.css'

export default function ServerError(props: { error: any }) {
  useEffect(() => {
    console.error('401 - Unauthorized')
  }, [props])

  return (
    <>
      <Head>
        <title>401 - Unauthorized</title>
        <meta
          name="description"
          content="Unauthorized. You need to be logged in to perform this action."
        />
      </Head>

      <Center
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <Stack>
          <Center>
            <ThemeIcon variant="outline" radius={200} size={200} p={30}>
              <Lock size={200} />
            </ThemeIcon>
          </Center>
          <Title className={classes.title}>Unauthorized Action</Title>
          <Text fz="md" ta="center" className={classes.description}>
            You need to be logged in to perform this action.
          </Text>
          <ButtonGroup />
        </Stack>
      </Center>
    </>
  )
}
