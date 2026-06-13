import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginScreen = ({ onLoginSuccess }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/api/auth/google', {
        token: credentialResponse.credential
      });
      localStorage.setItem('smart_assistant_session_id', res.data.session_id);
      localStorage.setItem('smart_assistant_user', JSON.stringify(res.data));
      onLoginSuccess(res.data);
    } catch (e) {
      console.error('Login failed:', e);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #020c1b 0%, #0a1628 30%, #0d2137 60%, #1a3a5c 100%)'
      }} />

      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: Math.random() * 3 + 1 + 'px',
          height: Math.random() * 3 + 1 + 'px',
          background: 'rgba(0,255,231,0.4)',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
        }} />
      ))}

      {/* Login Card */}
      <div className="relative z-10 text-center p-10 rounded-3xl"
        style={{
          background: 'rgba(10,22,40,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(74,168,216,0.2)',
          boxShadow: '0 0 60px rgba(0,255,231,0.1)'
        }}>

        <div className="text-6xl mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,231,0.5))' }}>
          🌊
        </div>

        <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--sky-dawn)' }}>
          Coral
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Smart Assistant dari kedalaman samudra
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
            theme="filled_black"
            shape="pill"
            text="signin_with"
          />
        </div>

        <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Login untuk menyimpan riwayat chat & jadwalmu secara pribadi
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;