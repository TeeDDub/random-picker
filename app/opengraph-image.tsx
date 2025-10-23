import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Random Picker - 랜덤 선택기'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* 배경 패턴 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            padding: '40px',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                fontSize: '60px',
              }}
            >
              🎲
            </div>
          ))}
        </div>

        {/* 메인 컨텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '80px 100px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* 아이콘 */}
          <div
            style={{
              fontSize: '120px',
              marginBottom: '30px',
            }}
          >
            🎲
          </div>

          {/* 제목 */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Random Picker
          </div>

          {/* 부제목 */}
          <div
            style={{
              fontSize: '36px',
              color: '#6b7280',
              marginBottom: '40px',
            }}
          >
            랜덤 선택기
          </div>

          {/* 설명 */}
          <div
            style={{
              fontSize: '28px',
              color: '#4b5563',
              maxWidth: '800px',
              lineHeight: 1.5,
            }}
          >
            직접 입력 · Google Sheets · 룰렛 애니메이션
          </div>

          {/* 기능 태그들 */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                background: '#8b5cf6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              🎰 룰렛 효과
            </div>
            <div
              style={{
                background: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              📊 Google Sheets
            </div>
            <div
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              💾 자동 저장
            </div>
          </div>
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: 'white',
            fontWeight: '500',
          }}
        >
          random.minhyeok.me
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

