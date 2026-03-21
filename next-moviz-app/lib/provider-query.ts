const VALID_PROVIDERS = ['vidfast', 'videasy', 'vidrock', 'cinemaos', 'vidplus', '2embed', 'vidsrc'] as const;

export type ProviderName = (typeof VALID_PROVIDERS)[number];

export function parseProvider(value: string | null): ProviderName | null {
  if (!value) return null;
  return (VALID_PROVIDERS as readonly string[]).includes(value) ? (value as ProviderName) : null;
}

export function getClientPreferredProvider(): ProviderName | null {
  if (typeof window === 'undefined') return null;

  const queryProvider = parseProvider(new URLSearchParams(window.location.search).get('provider'));
  if (queryProvider) return queryProvider;

  return parseProvider(window.localStorage.getItem('preferredPlayer'));
}

export function withProviderInPath(path: string, provider: string | null | undefined): string {
  const normalizedProvider = parseProvider(provider || null);
  if (!normalizedProvider) return path;

  try {
    const url = new URL(path, 'https://local.moviz');
    url.searchParams.set('provider', normalizedProvider);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path;
  }
}
