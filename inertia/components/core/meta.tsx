import { Head } from '@inertiajs/react'
import React from 'react'

interface MetaGenericProps {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonicalUrl?: string
  children?: React.ReactNode
}

const AppMeta: React.FC<MetaGenericProps> = ({
  title = 'Website',
  description = 'My website',
  keywords = 'website',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  children,
}) => {
  twitterTitle = twitterTitle || ogTitle || title
  twitterDescription = twitterDescription || ogDescription || description
  twitterImage = twitterImage || ogImage
  ogTitle = ogTitle || title
  ogDescription = ogDescription || description
  ogUrl = ogUrl || canonicalUrl || window.location.href
  ogImage = ogImage || twitterImage

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta
        name="twitter:description"
        content={twitterDescription || ogDescription || description}
      />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {children}
    </Head>
  )
}

export default AppMeta
