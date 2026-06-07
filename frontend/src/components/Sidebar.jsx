import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Sidebar = ({ currentSessionId, onNewChat, onSelectSession, sessions }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleNewChat = () => {
    const newId = uuidv4();
    localStorage.setItem("smart_assistant_session_id", newId);
    onNewChat(newId);
  };

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      >
        <span style={{ color: 'var(--sky-light)' }}>☰</span>
      </button>

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
        style={{
          background: 'rgba(2, 12, 27, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(74,168,216,0.1)',
          height: '100vh',
        }}>

        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(74,168,216,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #1e5f8e, #00ffe7)', boxShadow: '0 0 12px rgba(0,255,231,0.3)' }}>
              🌊
            </div>
            <div>
              <h1 className="font-display text-sm font-semibold" style={{ color: 'var(--sky-dawn)' }}>
                Coral
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Smart Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button onClick={handleNewChat}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--ocean-shallow), var(--sky-horizon))',
              color: 'var(--foam-white)',
              boxShadow: '0 2px 12px rgba(30,95,142,0.4)'
            }}>
            <span>✦</span> Chat Baru
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs px-2 mb-2 font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Riwayat
          </p>
          {sessions.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Belum ada riwayat
            </p>
          ) : (
            sessions.map((s, i) => (
              <button key={s.session_id}
                onClick={() => onSelectSession(s.session_id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all"
                style={{
                  background: s.session_id === currentSessionId
                    ? 'rgba(74,168,216,0.15)'
                    : 'transparent',
                  border: s.session_id === currentSessionId
                    ? '1px solid rgba(74,168,216,0.3)'
                    : '1px solid transparent',
                  color: s.session_id === currentSessionId
                    ? 'var(--sky-light)'
                    : 'var(--text-muted)',
                }}>
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span className="truncate">
                    {s.display_name || `Sesi ${sessions.length - i}`}
                  </span>
                </div>
                <div className="text-xs mt-0.5 opacity-60 pl-6">
                  {s.total_messages} pesan
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(74,168,216,0.1)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Powered by Gemini AI 🌊
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;