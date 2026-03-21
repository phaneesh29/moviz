import type { Metadata } from 'next';
import { imgBackdrop } from '@/lib/media-constants';
import { absoluteUrl, siteConfig } from '@/lib/site';

type BuildMediaMetadataInput = {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
};

export function buildMediaMetadata({ title, description, path, imagePath }: BuildMediaMetadataInput): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = imagePath ? `${imgBackdrop}${imagePath}` : absoluteUrl('/opengraph-image');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description,
      url: canonicalUrl,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
