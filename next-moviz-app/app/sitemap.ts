import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteConfig.url, lastModified, changeFrequency: 'hourly', priority: 1 },
    { url: `${siteConfig.url}/discover`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.url}/trending`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.url}/live-tv`, lastModified, changeFrequency: 'daily', priority: 0.85 },
    { url: `${siteConfig.url}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
