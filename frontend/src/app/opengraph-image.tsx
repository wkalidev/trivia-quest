import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TriviaQ'
export const size = { width: 1200, height: 800 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1A2E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Cercle jaune */}
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: '#F5C400',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Cercle blanc intérieur */}
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 140, color: '#F5C400', fontWeight: 'bold', lineHeight: 1 }}>
              Q
            </span>
          </div>
        </div>

        {/* Titre */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 80, color: 'white', fontWeight: 'bold' }}>
            TriviaQ
          </span>
          <span style={{ fontSize: 36, color: '#F5C400' }}>
            Jouer maintenant 🎮
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}