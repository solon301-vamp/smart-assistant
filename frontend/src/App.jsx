import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import WaveBackground from "./components/WaveBackground";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import ModeSelector from "./components/ModeSelector";
import Calendar from "./components/Calendar";
import NotificationManager from "./components/NotificationManager";
import { sendMessage, getHistory, deleteHistory } from "./services/api";

const getOrCreateSessionId = () => {
  const existing = localStorage.getItem("smart_assistant_session_id");
  if (existing) return existing;
  const newId = uuidv4();
  localStorage.setItem("smart_assistant_session_id", newId);
  return newId;
};

function App() {
  const [sessionId, setSessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode]           = useState("general");
  const [sessions, setSessions]   = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [lastAIMessage, setLastAIMessage] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Load sessions list
  const loadSessions = async () => {
    try {
      const res = await axios.get("/api/sessions");
      setSessions(res.data);
    } catch (e) {}
  };

  // Load history untuk session aktif
  const loadHistory = async (sid) => {
    setIsLoadingHistory(true);
    try {
      const history = await getHistory(sid);
      setMessages(history.map(h => ({
        role: h.role, content: h.content, id: h.id, liked: h.liked
      })));
    } catch (e) {
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory(sessionId);
    loadSessions();
  }, [sessionId]);

  const handleSend = useCallback(async (text) => {
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsLoading(true);
    try {
      const data = await sendMessage(text, sessionId, mode);
      setMessages(prev => [...prev, {
        role: "assistant", content: data.reply,
        id: data.message_id, liked: false
      }]);
      setLastAIMessage(data.reply);
      loadSessions();
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant", content: "⚠️ Terjadi error, coba lagi ya."
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, mode]);

  const handleNewChat = (newId) => {
    setSessionId(newId);
    setMessages([]);
  };

  const handleSelectSession = (sid) => {
    localStorage.setItem("smart_assistant_session_id", sid);
    setSessionId(sid);
  };

  const handleClearChat = async () => {
    try { await deleteHistory(sessionId); } catch (e) {}
    const newId = uuidv4();
    localStorage.setItem("smart_assistant_session_id", newId);
    setSessionId(newId);
    setMessages([]);
    loadSessions();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      <WaveBackground />
      <NotificationManager sessionId={sessionId} />

      {/* Sidebar */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar
          currentSessionId={sessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          sessions={sessions}
        />
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(2,12,27,0.6)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(74,168,216,0.1)'
          }}>
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-display text-sm" style={{ color: 'var(--sky-dawn)' }}>
                Coral Assistant
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Dari kedalaman samudra, untuk kamu 🌊
              </p>
            </div>
            <ModeSelector currentMode={mode} onModeChange={setMode} />
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Kalender */}
            <button onClick={() => setShowCalendar(true)}
              className="text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
              style={{
                background: 'rgba(0,255,231,0.1)',
                border: '1px solid rgba(0,255,231,0.3)',
                color: 'var(--biolum)'
              }}>
              📅 Jadwal
            </button>

            <button onClick={handleClearChat}
              className="text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
              style={{
                background: 'rgba(232,131,106,0.1)',
                border: '1px solid rgba(232,131,106,0.3)',
                color: '#e8836a'
              }}>
              🗑 Hapus Chat
            </button>
          </div>
        </header>

        {/* Chat Window */}
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm animate-pulse" style={{ color: 'var(--biolum)' }}>
              🌊 Memuat riwayat...
            </div>
          </div>
        ) : (
          <ChatWindow messages={messages} isLoading={isLoading} />
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 px-6 py-4"
          style={{
            background: 'rgba(2,12,27,0.6)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(74,168,216,0.1)'
          }}>
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            lastAIMessage={lastAIMessage}
          />
          <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Mode: <span style={{ color: 'var(--biolum)' }}>{mode}</span>
            {' · '}
            <span>Enter kirim · Shift+Enter baris baru</span>
          </p>
        </div>
      </main>
      <Calendar
        sessionId={sessionId}
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </div>
  );
}

export default App;