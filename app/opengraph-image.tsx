import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Collector's Vaults — Track. Collect. Connect."
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #050B16 0%, #0B1626 52%, #111827 100%)',
          color: '#F4F1E8',
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
          padding: '64px 78px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            border: '2px solid #F59E0B',
            borderRadius: 999,
            boxShadow: '0 0 90px rgba(245, 158, 11, 0.25)',
            height: 540,
            left: -170,
            opacity: 0.65,
            position: 'absolute',
            top: -160,
            width: 540,
          }}
        />
        <div
          style={{
            background: '#F59E0B',
            height: 630,
            opacity: 0.85,
            position: 'absolute',
            right: 96,
            top: 0,
            width: 4,
          }}
        />
        <div style={{ alignItems: 'center', display: 'flex', gap: 62, position: 'relative' }}>
          <div
            style={{
              alignItems: 'center',
              background: '#0A1422',
              border: '2px solid #F59E0B',
              borderRadius: 36,
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.25)',
              display: 'flex',
              height: 320,
              justifyContent: 'center',
              overflow: 'hidden',
              width: 320,
            }}
          >
            <img
              alt="Collector's Vaults emblem"
              height="320"
              src="https://collectorsvaults.org/collectors.vaults.logo.png"
              style={{ objectFit: 'cover' }}
              width="320"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 610 }}>
            <div style={{ color: '#F59E0B', display: 'flex', fontSize: 27, fontWeight: 700, letterSpacing: 7, marginBottom: 18 }}>
              PREMIUM DIECAST COLLECTING
            </div>
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.04 }}>
              Collector&apos;s Vaults
            </div>
            <div style={{ color: '#A8B6C8', display: 'flex', fontSize: 31, lineHeight: 1.35, marginTop: 28 }}>
              Track your collection. Discover rare finds. Connect with collectors.
            </div>
            <div style={{ background: '#F59E0B', display: 'flex', height: 5, marginTop: 38, width: 210 }} />
          </div>
        </div>
      </div>
    ),
    size,
  )
}
