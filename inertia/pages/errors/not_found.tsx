'use client'

import { Head } from '@inertiajs/react'
import { Center, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { CircleQuestionMark } from 'lucide-react'
import { useEffect } from 'react'

import ButtonGroup from './button_group'
import classes from './error.module.css'

export default function ServerError(props: { error: any }) {
  useEffect(() => {
    console.error('404 - Page Not Found')
  }, [props])

  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta
          name="description"
          content="Page not found. You may have mistyped the address, or the page may have been moved to a different URL."
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
              <CircleQuestionMark size={200} />
            </ThemeIcon>
          </Center>
          <Title className={classes.title}>Page Not Found </Title>
          <Text fz="md" ta="center" className={classes.description}>
            It seems that the page you are looking for does not exist.
          </Text>
          <ButtonGroup />
        </Stack>
      </Center>
    </>
  )
}
