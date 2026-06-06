import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import ModeSelector from "./components/ModeSelector";
import { sendMessage, getHistory, deleteHistory } from "./services/api";

// Ambil session_id dari localStorage atau buat baru
const getOrCreateSessionId = () => {
  const existing = localStorage.getItem("smart_assistant_session_id");
  if (existing) return existing;
  const newId = uuidv4();
  localStorage.setItem("smart_assistant_session_id", newId);
  return newId;
};

const SESSION_ID = getOrCreateSessionId();

function App() {
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode]           = useState("general");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load history saat pertama buka
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getHistory(SESSION_ID);
        if (history.length > 0) {
          setMessages(history.map(h => ({
            role: h.role,
            content: h.content,
            id: h.id,
            liked: h.liked
          })));
        }
      } catch (err) {
        console.error("Gagal load history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  const handleSend = useCallback(async (text) => {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const data = await sendMessage(text, SESSION_ID, mode);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          id: data.message_id,
          liked: false
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Terjadi error, coba lagi ya." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  const handleClearChat = async () => {
    try {
      await deleteHistory(SESSION_ID);
    } catch (err) {
      console.error("Gagal hapus history:", err);
    }
    // Buat session baru
    const newId = uuidv4();
    localStorage.setItem("smart_assistant_session_id", newId);
    window.location.reload();
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-blue-500 text-lg animate-pulse">Memuat riwayat chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "85vh" }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 font-bold text-lg shadow">
                🤖
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Smart Assistant</h1>
                <p className="text-blue-100 text-xs">Powered by Gemini AI</p>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="text-blue-100 hover:text-white text-sm transition-colors"
            >
              🗑 Clear
            </button>
          </div>
          <ModeSelector currentMode={mode} onModeChange={setMode} />
        </div>

        {/* Chat Area */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input Area */}
        <div className="border-t border-gray-100 px-4 py-3">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
          <p className="text-center text-gray-300 text-xs mt-2">
            Mode aktif: <span className="text-blue-400 font-medium">{mode}</span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;