const WaveBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    {/* Deep ocean gradient */}
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(180deg, #020c1b 0%, #0a1628 30%, #0d2137 60%, #1a3a5c 100%)'
    }} />

    {/* Aurora/bioluminescence effect */}
    <div className="absolute inset-0 opacity-20" style={{
      background: 'radial-gradient(ellipse at 20% 50%, rgba(0,255,231,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(41,128,185,0.2) 0%, transparent 50%)',
    }} />

    {/* Stars/particles */}
    {[...Array(30)].map((_, i) => (
      <div key={i} className="absolute rounded-full" style={{
        width: Math.random() * 3 + 1 + 'px',
        height: Math.random() * 3 + 1 + 'px',
        background: `rgba(${Math.random() > 0.5 ? '135,206,235' : '0,255,231'},${Math.random() * 0.6 + 0.2})`,
        left: Math.random() * 100 + '%',
        top: Math.random() * 60 + '%',
        animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
        animationDelay: Math.random() * 4 + 's',
      }} />
    ))}

    {/* Bubbles */}
    {[...Array(12)].map((_, i) => (
      <div key={i} className="absolute rounded-full border" style={{
        width: Math.random() * 20 + 6 + 'px',
        height: Math.random() * 20 + 6 + 'px',
        borderColor: 'rgba(0,255,231,0.3)',
        background: 'rgba(0,255,231,0.03)',
        left: Math.random() * 100 + '%',
        bottom: '-50px',
        animation: `bubble-rise ${Math.random() * 8 + 6}s linear infinite`,
        animationDelay: Math.random() * 8 + 's',
      }} />
    ))}

    {/* Wave layers */}
    <div className="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{
        width: '100%', height: '80px', opacity: 0.15,
        animation: 'wave 6s ease-in-out infinite'
      }}>
        <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
          fill="rgba(74,168,216,0.5)" />
      </svg>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{
        width: '100%', height: '60px', opacity: 0.1, marginTop: '-40px',
        animation: 'wave 8s ease-in-out infinite reverse'
      }}>
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1350,30 1440,40 L1440,120 L0,120 Z"
          fill="rgba(0,255,231,0.4)" />
      </svg>
    </div>
  </div>
);

export default WaveBackground;