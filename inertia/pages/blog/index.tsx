import type { PaginationMeta } from '#types/app'

import { router } from '@inertiajs/react'
import { Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AppMeta from '~/components/core/meta'
import BlogCard from '~/components/page-components/blog/blog-card'
import PublicPageShell from '~/components/page-components/public/public-page-shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import PublicLayout from '~/layouts/public'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'
import type { Data } from '~data'

type BlogSort = 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc'

type PageProps = InertiaProps<{
  data: Data.Blog[]
  meta: PaginationMeta
  filters: {
    search: string
    sort: BlogSort
    per_page: number
  }
}>

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Created: Newest' },
  { value: 'created_asc', label: 'Created: Oldest' },
  { value: 'updated_desc', label: 'Updated: Newest' },
  { value: 'updated_asc', label: 'Updated: Oldest' },
] as const

export default function BlogPage(props: PageProps) {
  const { data, meta, filters } = props
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [sortInput, setSortInput] = useState(filters.sort || 'created_desc')
  const firstSearchRenderRef = useRef(true)

  const doSearch = (search: string, page = 1, sort = sortInput) => {
    router.get(
      urlFor('blog'),
      {
        search,
        page,
        sort,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    )
  }

  useEffect(() => {
    if (firstSearchRenderRef.current) {
      firstSearchRenderRef.current = false
      return
    }

    const timeout = setTimeout(() => {
      const current = (filters.search || '').trim()
      const next = searchInput.trim()
      if (current !== next) doSearch(next, 1)
    }, 450)

    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    if ((filters.sort || 'created_desc') !== sortInput) {
      doSearch(searchInput, 1, sortInput)
    }
  }, [sortInput])

  const onPageChange = (page: number) => {
    doSearch(filters.search || '', page, sortInput)
  }

  return (
    <PublicLayout>
      <AppMeta title={'Blogs'} description={'Blog post of xxx'} />
      <PublicPageShell
        breadcrumbs={[
          { label: 'Home', href: urlFor('home') },
          { label: 'Blog', current: true },
        ]}
      >
        <section className="font-geistmono rounded-base border-2 border-border bg-background p-5 shadow-shadow">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-base border-2 border-border px-2 py-1 text-xs font-heading dark:bg-main bg-secondary-background text-foreground dark:text-main-foreground">
                <Sparkles className="size-3.5" />
                BLOG
              </div>
              <h1 className="text-3xl font-heading sm:text-4xl">Blog post...</h1>
              <p className="mt-2 max-w-2xl text-sm text-foreground/80">
                You can post your thoughts here.
              </p>
            </div>
            <div className="text-xs font-heading text-foreground/80">
              Page {meta.current_page} of {meta.last_page}
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <div className="relative w-full sm:flex-1 sm:min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/60" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
                placeholder="Search title, description, slug, tags..."
                className="pl-9"
              />
            </div>

            <select
              value={sortInput}
              onChange={(e) => setSortInput(e.currentTarget.value as any)}
              className="h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm font-base"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="neutral"
              onClick={() => {
                setSearchInput('')
                setSortInput('created_desc')
                doSearch('', 1, 'created_desc')
              }}
            >
              Reset
            </Button>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </section>

        {data.length === 0 ? (
          <section className="font-geistmono mt-6 rounded-base border-2 border-border bg-secondary-background p-8 text-center shadow-shadow">
            <p className="text-lg font-heading">No post found</p>
            {searchInput && (
              <p className="mt-1 text-sm text-foreground/70">Try another keyword or sort option.</p>
            )}
          </section>
        ) : null}

        {meta.last_page > 1 ? (
          <section className="font-geistmono mt-6 flex items-center justify-center gap-2">
            <Button
              variant="neutral"
              disabled={meta.current_page <= 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              Prev
            </Button>
            <Badge variant="neutral">
              {meta.current_page} / {meta.last_page}
            </Badge>
            <Button
              variant="neutral"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              Next
            </Button>
          </section>
        ) : null}
      </PublicPageShell>
    </PublicLayout>
  )
}
