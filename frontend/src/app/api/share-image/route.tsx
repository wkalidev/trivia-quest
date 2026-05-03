import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const score = searchParams.get('score') ?? '0'
  const total = searchParams.get('total') ?? '10'
  const points = searchParams.get('points') ?? '0'
  const rank = searchParams.get('rank') ?? '?'

  const accuracy = Math.round((parseInt(score) / parseInt(total)) * 100)

  const medalEmoji =
    accuracy >= 90 ? '🥇' :
    accuracy >= 70 ? '🥈' :
    accuracy >= 50 ? '🥉' : '🎮'

  const formattedPoints = parseInt(points) >= 1000
    ? `${(parseInt(points) / 1000).toFixed(1)}K`
    : points

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #050709 60%, #0a0f1e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glows */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 350, height: 350, borderRadius: '50%',
          background: 'rgba(251,205,0,0.07)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(53,208,127,0.06)', display: 'flex',
        }} />

        {/* Logo top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#F5C400',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28, color: '#F5C400', fontWeight: 'bold' }}>Q</span>
            </div>
          </div>
          <span style={{ fontSize: 40, color: 'white', fontWeight: 900 }}>
            Trivia<span style={{ color: '#FBCD00' }}>Q</span>
          </span>
        </div>

        {/* Medal + title */}
        <div style={{ fontSize: 72, marginBottom: 8 }}>{medalEmoji}</div>
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
          My Score
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
          {/* Score */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(251,205,0,0.08)',
            border: '1px solid rgba(251,205,0,0.2)',
            borderRadius: 24, padding: '24px 36px',
          }}>
            <span style={{ fontSize: 64, color: '#FBCD00', fontWeight: 900, lineHeight: 1 }}>
              {score}/{total}
            </span>
            <span style={{ fontSize: 18, color: 'rgba(251,205,0,0.5)', marginTop: 8 }}>Correct</span>
          </div>

          {/* Points */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 24, padding: '24px 36px',
          }}>
            <span style={{ fontSize: 64, color: '#A78BFA', fontWeight: 900, lineHeight: 1 }}>
              {formattedPoints}
            </span>
            <span style={{ fontSize: 18, color: 'rgba(139,92,246,0.5)', marginTop: 8 }}>Points</span>
          </div>

          {/* Accuracy */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(53,208,127,0.08)',
            border: '1px solid rgba(53,208,127,0.2)',
            borderRadius: 24, padding: '24px 36px',
          }}>
            <span style={{ fontSize: 64, color: '#35D07F', fontWeight: 900, lineHeight: 1 }}>
              {accuracy}%
            </span>
            <span style={{ fontSize: 18, color: 'rgba(53,208,127,0.5)', marginTop: 8 }}>Accuracy</span>
          </div>
        </div>

        {/* Rank badge if available */}
        {rank !== '?' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(251,205,0,0.1)',
            border: '1px solid rgba(251,205,0,0.25)',
            borderRadius: 16, padding: '12px 28px',
            marginBottom: 32,
          }}>
            <span style={{ fontSize: 22, color: '#FBCD00', fontWeight: 900 }}>
              🏆 Rank #{rank} on-chain
            </span>
          </div>
        )}

        {/* CTA */}
        <div style={{
          display: 'flex',
          background: '#FBCD00',
          borderRadius: 16, padding: '14px 32px',
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#0a0f1e' }}>
            Can you beat me? → trivia-quest-eight.vercel.app
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}