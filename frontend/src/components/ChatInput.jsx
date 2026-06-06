import { useState, useEffect } from "react";

const ChatInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Cek apakah browser support Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = "id-ID"; // Bahasa Indonesia
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      setRecognition(rec);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognition) {
      alert("Browser kamu tidak mendukung voice input.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      {/* Tombol Voice */}
      <button
        onClick={toggleVoice}
        className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
          isListening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
        title={isListening ? "Klik untuk stop" : "Klik untuk bicara"}
      >
        {isListening ? "🔴" : "🎤"}
      </button>

      {/* Input Text */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isListening
            ? "Sedang mendengarkan..."
            : "Ketik atau tekan 🎤 untuk bicara..."
        }
        rows={1}
        className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        style={{ maxHeight: "120px" }}
      />

      {/* Tombol Kirim */}
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-2xl px-5 py-3 text-sm font-medium transition-all flex-shrink-0"
      >
        {isLoading ? (
          <span className="flex items-center gap-1">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </span>
        ) : (
          "Kirim ➤"
        )}
      </button>
    </div>
  );
};

export default ChatInput;