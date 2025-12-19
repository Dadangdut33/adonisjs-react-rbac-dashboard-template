export const NAVIGATION_LINKS = [
  { text: 'Projects', href: '#projects' },
  { text: 'Blog', href: '#blog' },
]

export const TIMEOUT_SHORT = 1000 * 60 * 3 // 3 minute
export const TIMEOUT_NORMAL = 1000 * 60 * 5 // 5 minutes
export const TIMEOUT_EXTENDED = 1000 * 60 * 15 // 15 minutes

export const PASS_REQ = [
  { re: /[0-9]/, label: 'Must contain at least one number' },
  { re: /[a-z]/, label: 'Must contain at least one lowercase letter' },
  { re: /[A-Z]/, label: 'Must contain at least one uppercase letter' },
  { re: /[^A-Za-z0-9]/, label: 'Must contain at least one special character' }, // regex “any character that is not a letter or number."
]
export const PASS_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/ // min 8 chars, 1 upper, 1 lower, 1 number, 1 special char
