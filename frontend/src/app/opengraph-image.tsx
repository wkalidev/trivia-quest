import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TriviaQ — Play. Learn. Earn on Celo.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Fetch live stats
  let players = '—'
  let prizePool = '—'

  try {
    // getTotalPlayers()
    const playersRes = await fetch('https://forno.celo.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{ to: '0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb', data: '0x63f28e0d' }, 'latest']
      }),
      next: { revalidate: 60 }
    })
    const playersData = await playersRes.json()
    if (playersData.result && playersData.result !== '0x') {
      players = String(parseInt(playersData.result, 16))
    }

    // getCurrentRound() — index 1 = prizePool
    const roundRes = await fetch('https://forno.celo.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 2, method: 'eth_call',
        params: [{ to: '0xffe22d3d1b63866ac9da8ac92fdb9ceddeadb0bb', data: '0xc8e9e4b1' }, 'latest']
      }),
      next: { revalidate: 60 }
    })
    const roundData = await roundRes.json()
    if (roundData.result && roundData.result !== '0x') {
      const raw = BigInt(roundData.result.slice(0, 66))
      const celo = Number(raw) / 1e18
      prizePool = celo > 0 ? `${celo.toFixed(3)} CELO` : '0 CELO'
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #050709 60%, #0a0f1e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(251,205,0,0.08)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(53,208,127,0.06)',
          display: 'flex',
        }} />

        {/* LEFT — Logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: '#F5C400',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 74, height: 74, borderRadius: '50%',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 52, color: '#F5C400', fontWeight: 'bold', lineHeight: 1 }}>Q</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 72, color: 'white', fontWeight: 900, lineHeight: 1 }}>
                Trivia<span style={{ color: '#FBCD00' }}>Q</span>
              </span>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                $TRIVQ · Celo Mainnet
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 36, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
              Play. Learn. Earn on Celo.
            </span>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.35)' }}>
              446 questions · 6 categories · Real rewards
            </span>
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex',
            background: '#FBCD00',
            borderRadius: 16,
            padding: '16px 36px',
            width: 'fit-content',
          }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0a0f1e' }}>
              🎮 trivia-quest-eight.vercel.app
            </span>
          </div>
        </div>

        {/* RIGHT — Live stats */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          minWidth: 260,
        }}>
          {/* Live badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(53,208,127,0.1)',
            border: '1px solid rgba(53,208,127,0.3)',
            borderRadius: 12, padding: '8px 20px',
            width: 'fit-content', marginBottom: 8,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: '#35D07F',
              display: 'flex',
            }} />
            <span style={{ fontSize: 18, color: '#35D07F', fontWeight: 700 }}>LIVE</span>
          </div>

          {/* Players stat */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: 'rgba(53,208,127,0.06)',
            border: '1px solid rgba(53,208,127,0.15)',
            borderRadius: 20, padding: '20px 28px',
          }}>
            <span style={{ fontSize: 52, color: '#35D07F', fontWeight: 900, lineHeight: 1 }}>{players}</span>
            <span style={{ fontSize: 18, color: 'rgba(53,208,127,0.5)', marginTop: 6 }}>Players</span>
          </div>

          {/* Prize pool stat */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: 'rgba(251,205,0,0.06)',
            border: '1px solid rgba(251,205,0,0.15)',
            borderRadius: 20, padding: '20px 28px',
          }}>
            <span style={{ fontSize: 40, color: '#FBCD00', fontWeight: 900, lineHeight: 1 }}>{prizePool}</span>
            <span style={{ fontSize: 18, color: 'rgba(251,205,0,0.5)', marginTop: 6 }}>Prize Pool</span>
          </div>

          {/* Questions stat */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 20, padding: '20px 28px',
          }}>
            <span style={{ fontSize: 52, color: '#A78BFA', fontWeight: 900, lineHeight: 1 }}>446</span>
            <span style={{ fontSize: 18, color: 'rgba(139,92,246,0.5)', marginTop: 6 }}>Questions</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}