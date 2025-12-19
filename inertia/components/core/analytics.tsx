import { isProd } from '~/lib/utils'

export default function Analytics({ id, url }: { id?: string; url?: string }) {
  if (!isProd()) return null
  if (!url || !id) return null
  // only load the analytics script in production
  return <script defer src={url} data-website-id={id}></script>
}
