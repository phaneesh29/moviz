import React from 'react'
import { Helmet } from 'react-helmet-async'

const Seo = ({ title, description, canonical, openGraph = {}, jsonLd = null }) => {
  const og = {
    title: openGraph.title || title,
    description: openGraph.description || description,
    type: openGraph.type || 'website',
    url: openGraph.url || (typeof window !== 'undefined' ? window.location.href : undefined),
    image: openGraph.image || undefined,
  }

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {og.title && <meta property="og:title" content={og.title} />}
      {og.description && <meta property="og:description" content={og.description} />}
      {og.type && <meta property="og:type" content={og.type} />}
      {og.url && <meta property="og:url" content={og.url} />}
      {og.image && <meta property="og:image" content={og.image} />}

      {/* Twitter */}
      {og.title && <meta name="twitter:title" content={og.title} />}
      {og.description && <meta name="twitter:description" content={og.description} />}
      {og.image && <meta name="twitter:image" content={og.image} />}

      {/* JSON-LD */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}

export default Seo
