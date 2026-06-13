import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import WaveBackground from "./components/WaveBackground";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import ModeSelector from "./components/ModeSelector";
import Calendar from "./components/Calendar";
import NotificationManager from "./components/NotificationManager";
import LoginScreen from "./components/LoginScreen";
import { sendMessage, getHistory, deleteHistory } from "./services/api";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("smart_assistant_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [sessionId, setSessionId] = useState(() =>
    localStorage.getItem("smart_assistant_session_id")
  );
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("general");
  const [sessions, setSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [lastAIMessage, setLastAIMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadSessions = async () => {
    try {
      const res = await axios.get("/api/sessions");
      setSessions(res.data.filter((s) => s.session_id === sessionId));
    } catch (e) {}
  };

  const loadHistory = async (sid) => {
    setIsLoadingHistory(true);
    try {
      const history = await getHistory(sid);
      setMessages(
        history.map((h) => ({
          role: h.role,
          content: h.content,
          id: h.id,
          liked: h.liked,
        }))
      );
    } catch (e) {
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadHistory(sessionId);
      loadSessions();
    }
  }, [sessionId]);

  const handleLoginSuccess = (data) => {
    setUser(data);
    setSessionId(data.session_id);
  };

  const handleLogout = () => {
    localStorage.removeItem("smart_assistant_session_id");
    localStorage.removeItem("smart_assistant_user");
    setUser(null);
    setSessionId(null);
    setMessages([]);
  };

  const handleSend = useCallback(
    async (text) => {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setIsLoading(true);
      try {
        const data = await sendMessage(text, sessionId, mode);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            id: data.message_id,
            liked: false,
          },
        ]);
        setLastAIMessage(data.reply);
        loadSessions();
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Terjadi error, coba lagi ya." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, mode]
  );

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleClearChat = async () => {
    try {
      await deleteHistory(sessionId);
    } catch (e) {}
    setMessages([]);
    loadSessions();
  };

  if (!user || !sessionId) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      <WaveBackground />
      <NotificationManager sessionId={sessionId} />

      {/* Sidebar - overlay on mobile */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-30 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          currentSessionId={sessionId}
          onNewChat={handleNewChat}
          onSelectSession={() => {}}
          sessions={sessions}
          user={user}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Overlay backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main
        className="flex-1 flex flex-col overflow-hidden min-w-0"
        style={{ position: "relative", zIndex: 10 }}
      >
        {/* Header */}
        <header
          className="flex-shrink-0 px-3 md:px-6 py-3 md:py-4 overflow-x-hidden"
          style={{
            background: "rgba(2,12,27,0.6)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(74,168,216,0.1)",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(74,168,216,0.1)",
                  color: "var(--sky-light)",
                }}
              >
                ☰
              </button>
              <div className="min-w-0">
                <h2
                  className="font-display text-sm truncate"
                  style={{ color: "var(--sky-dawn)" }}
                >
                  Coral Assistant
                </h2>
                <p
                  className="text-xs hidden md:block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Dari kedalaman samudra, untuk kamu 🌊
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowCalendar(true)}
                className="text-xs px-2 md:px-3 py-1.5 rounded-xl transition-all hover:opacity-80 whitespace-nowrap"
                style={{
                  background: "rgba(0,255,231,0.1)",
                  border: "1px solid rgba(0,255,231,0.3)",
                  color: "var(--biolum)",
                }}
              >
                📅 <span className="hidden sm:inline">Jadwal</span>
              </button>
              <button
                onClick={handleClearChat}
                className="text-xs px-2 md:px-3 py-1.5 rounded-xl transition-all hover:opacity-80 whitespace-nowrap"
                style={{
                  background: "rgba(232,131,106,0.1)",
                  border: "1px solid rgba(232,131,106,0.3)",
                  color: "#e8836a",
                }}
              >
                🗑 <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          </div>

          {/* Mode Selector - scrollable on mobile */}
          <div
            className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            <div className="inline-flex">
              <ModeSelector currentMode={mode} onModeChange={setMode} />
            </div>
          </div>
        </header>

        {/* Chat Window */}
        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="text-sm animate-pulse"
              style={{ color: "var(--biolum)" }}
            >
              🌊 Memuat riwayat...
            </div>
          </div>
        ) : (
          <ChatWindow messages={messages} isLoading={isLoading} />
        )}

        {/* Input Area */}
        <div
          className="flex-shrink-0 px-3 md:px-6 py-3 md:py-4"
          style={{
            background: "rgba(2,12,27,0.6)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(74,168,216,0.1)",
          }}
        >
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            lastAIMessage={lastAIMessage}
          />
          <p
            className="text-center text-xs mt-2"
            style={{ color: "var(--text-muted)" }}
          >
            Mode: <span style={{ color: "var(--biolum)" }}>{mode}</span>
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