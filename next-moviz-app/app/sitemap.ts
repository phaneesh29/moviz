import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: 'https://moviz.app', lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://moviz.app/discover', lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://moviz.app/search', lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://moviz.app/trending', lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://moviz.app/live-tv', lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://moviz.app/watch-later', lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: 'https://moviz.app/about', lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://moviz.app/feedback', lastModified, changeFrequency: 'monthly', priority: 0.4 },
  ];
}


