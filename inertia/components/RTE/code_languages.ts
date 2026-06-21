import { all, createLowlight } from 'lowlight'

export const lowlight = createLowlight(all)

const formatLanguageLabel = (language: string) =>
  language
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export const CODE_LANGUAGE_OPTIONS = [
  { value: 'plaintext', label: 'Plain Text' },
  ...lowlight
    .listLanguages()
    .sort((a, b) => a.localeCompare(b))
    .filter((language) => language !== 'plaintext')
    .map((language) => ({
      value: language,
      label: formatLanguageLabel(language),
    })),
]
