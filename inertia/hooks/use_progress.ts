import { GlobalEvent } from '@inertiajs/core'
import { router } from '@inertiajs/react'
import { nprogress } from '@mantine/nprogress'
import { isEmpty } from 'lodash-es'
import { useEffect, useState } from 'react'

const useProgressWhenRendering = () => {
  const [isRendering, setIsRendering] = useState(false)
  const [currentUrl, setCurrentUrl] = useState<string | null>(window.location.href)

  useEffect(() => {
    setCurrentUrl(window.location.href)

    const verifyOnlyVisit = (event: GlobalEvent<'start'> | GlobalEvent<'finish'>) => {
      if (event.detail.visit.url.searchParams.size !== 0) return false
      if (event.detail.visit.method !== 'get') return false
      if (!isEmpty(event.detail.visit.data)) return false

      return true
    }

    // only when its page visit
    router.on('start', (event) => {
      if (verifyOnlyVisit(event)) {
        if (event.detail.visit.url.href !== currentUrl) {
          nprogress.start()
          setCurrentUrl(event.detail.visit.url.href)
          setIsRendering(true)
        }
      }
    })
    router.on('finish', (event) => {
      if (verifyOnlyVisit(event)) {
        nprogress.complete()
        setIsRendering(false)
      }
    })
  }, [])

  return { isRendering }
}

export default useProgressWhenRendering
