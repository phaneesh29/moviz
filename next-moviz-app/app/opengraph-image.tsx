import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background:
            'radial-gradient(circle at top left, rgba(229,9,20,0.4), transparent 32%), linear-gradient(135deg, #111111 0%, #050505 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '64px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 36,
            background: 'linear-gradient(180deg, rgba(22,22,22,0.86), rgba(10,10,10,0.94))',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ color: '#e50914', fontSize: 68, fontWeight: 900 }}>V</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4 }}>VIDOZA</div>
              <div style={{ fontSize: 18, color: '#a3a3a3', letterSpacing: 6 }}>PREMIUM STREAMING</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760 }}>
            <div style={{ fontSize: 78, lineHeight: 1, fontWeight: 900 }}>Trending movies, TV shows and live channels.</div>
            <div style={{ fontSize: 28, lineHeight: 1.4, color: '#d4d4d4' }}>
              Stream-first discovery, cinematic browsing, live TV, and premium Vercel-ready SEO.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <div style={{ padding: '12px 22px', borderRadius: 999, background: '#e50914', fontSize: 22, fontWeight: 700 }}>Discover</div>
            <div style={{ padding: '12px 22px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', fontSize: 22, color: '#d4d4d4' }}>Search</div>
            <div style={{ padding: '12px 22px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', fontSize: 22, color: '#d4d4d4' }}>Live TV</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
