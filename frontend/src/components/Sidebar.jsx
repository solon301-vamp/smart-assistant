import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Sidebar = ({ currentSessionId, onNewChat, sessions, user, onLogout, onClose }) => {
  return (
    <aside className="flex flex-col w-64 h-full"
      style={{
        background: 'rgba(2, 12, 27, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(74,168,216,0.1)',
      }}>

      {/* Logo + Close button (mobile) */}
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(74,168,216,0.1)' }}>
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
        <button onClick={onClose} className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(74,168,216,0.1)', color: 'var(--text-muted)' }}>
          ✕
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button onClick={onNewChat}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, var(--ocean-shallow), var(--sky-horizon))',
            color: 'var(--foam-white)',
            boxShadow: '0 2px 12px rgba(30,95,142,0.4)'
          }}>
          <span>✦</span> Chat Baru
        </button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-xs px-2 mb-2 font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Riwayat
        </p>
        {sessions.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            Belum ada riwayat
          </p>
        ) : (
          sessions.map((s) => (
            <div key={s.session_id}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs"
              style={{
                background: 'rgba(74,168,216,0.15)',
                border: '1px solid rgba(74,168,216,0.3)',
                color: 'var(--sky-light)',
              }}>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span className="truncate">Percakapan Aktif</span>
              </div>
              <div className="text-xs mt-0.5 opacity-60 pl-6">
                {s.total_messages} pesan
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Profile + Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(74,168,216,0.1)' }}>
        {user && (
          <div className="flex items-center gap-3 mb-3">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--sky-horizon)', color: 'white' }}>
                {user.display_name?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user.display_name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          className="w-full text-xs py-2 rounded-xl transition-all"
          style={{
            background: 'rgba(232,131,106,0.1)',
            border: '1px solid rgba(232,131,106,0.2)',
            color: '#e8836a'
          }}>
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;