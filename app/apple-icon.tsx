import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 장식 요소들 */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'rotate(15deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '15px',
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '20px',
            width: '18px',
            height: '18px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'rotate(-20deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25px',
            right: '10px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
          }}
        />

        {/* 메인 주사위 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
            borderRadius: '18px',
            width: '100px',
            height: '100px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
            position: 'relative',
          }}
        >
          {/* 주사위 점들 (5) - 중앙 패턴 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
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

