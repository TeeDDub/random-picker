import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #6366F1 100%)',
          borderRadius: '6px',
        }}
      >
        {/* 작은 주사위 표현 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '4px',
            width: '20px',
            height: '20px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              <div
                style={{
                  width: '2.5px',
                  height: '2.5px',
                  borderRadius: '50%',
                  background: '#7C3AED',
                }}
              />
              <div
                style={{
                  width: '2.5px',
                  height: '2.5px',
                  borderRadius: '50%',
                  background: '#7C3AED',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '2.5px',
                  height: '2.5px',
                  borderRadius: '50%',
                  background: '#7C3AED',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              <div
                style={{
                  width: '2.5px',
                  height: '2.5px',
                  borderRadius: '50%',
                  background: '#7C3AED',
                }}
              />
              <div
                style={{
                  width: '2.5px',
                  height: '2.5px',
                  borderRadius: '50%',
                  background: '#7C3AED',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

