import env from '#start/env'

import drive from '@adonisjs/drive/services/main'

const VISIBILITY = env.get('S3_VISIBILITY', 'private')

export function getMediaUrlByKey(key: string) {
  const disk = drive.use()

  if (VISIBILITY === 'private') {
    return disk.getSignedUrl(key)
  }

  return disk.getUrl(key)
}
