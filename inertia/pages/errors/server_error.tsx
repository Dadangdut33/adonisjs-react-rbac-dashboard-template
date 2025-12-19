'use client'

import { Head } from '@inertiajs/react'
import { Center, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { CloudAlert } from 'lucide-react'
import { useEffect } from 'react'

import ButtonGroup from './button_group'
import classes from './error.module.css'

export default function ServerError(props: { error: any }) {
  useEffect(() => {
    console.error(props.error)
  }, [props])

  return (
    <>
      <Head>
        <title>Server Error</title>
        <meta
          name="description"
          content="An unexpected error occurred. Please try again later or contact site owner if the problem persists."
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
              <CloudAlert size={200} />
            </ThemeIcon>
          </Center>
          <Title className={classes.title}>Sorry, an unexpected error occurred</Title>
          <Text fz="md" ta="center" className={classes.description}>
            {props.error.message}
          </Text>
          <ButtonGroup />
        </Stack>
      </Center>
    </>
  )
}
