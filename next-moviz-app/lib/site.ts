export const siteConfig = {
  name: 'Vidoza',
  shortName: 'Vidoza',
  domain: 'vidoza.vercel.app',
  url: 'https://vidoza.vercel.app',
  description:
    'Discover trending movies, TV shows, and cast details with a premium streaming-first experience on Vidoza.',
  keywords: [
    'Vidoza',
    'movies',
    'tv shows',
    'streaming',
    'watch online',
    'trending movies',
    'movie discovery',
    'tv series',
  ],
};

export function absoluteUrl(path = '/') {
  return new URL(path, siteConfig.url).toString();
}
