import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'JoueurVIP - Plateforme privée de services'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {/* Icon */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 48 48"
            fill="none"
          >
            <rect
              x="24"
              y="4"
              width="28"
              height="28"
              rx="3"
              transform="rotate(45 24 24)"
              fill="#c9a227"
            />
            <path
              d="M24 14L34 24L24 34L14 24L24 14Z"
              fill="#0e0e0e"
            />
            <circle cx="24" cy="24" r="3" fill="#c9a227" />
          </svg>
          {/* Text */}
          <span
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            JoueurVIP
          </span>
        </div>
        {/* Tagline */}
        <p
          style={{
            fontSize: '28px',
            color: '#888888',
            margin: 0,
          }}
        >
          Plateforme privée de services pour joueurs
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
