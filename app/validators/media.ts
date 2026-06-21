import vine from '@vinejs/vine'

const allowedImageTags = ['blog-content'] as const
export type AllowedImageTags = (typeof allowedImageTags)[number]

export const mediaUploadAPIValidator = vine.create(
  vine.object({
    file: vine.file({
      size: '50mb',
      extnames: [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'mp4',
        'mov',
        'avi',
        'mkv',
        'mp3',
        'wav',
        'm4a',
        'flac',
        'ogg',
        'aac',
        'opus',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'odt',
        'ods',
        'odp',
        'rtf',
        'csv',
        'txt',
        'zip',
        'rar',
        '7z',
        'tar',
        'gz',
        'bz2',
        'xz',
      ],
    }),
    tags: vine
      .array(
        vine
          .string()
          .trim()
          .in(allowedImageTags as unknown as string[])
      )
      .optional(),
  })
)

export const mediaImportUrlAPIValidator = vine.create(
  vine.object({
    url: vine.string().trim().url(),
    tags: vine
      .array(
        vine
          .string()
          .trim()
          .in(allowedImageTags as unknown as string[])
      )
      .optional(),
  })
)
