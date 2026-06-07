import { useState, useEffect } from "react";

const ChatInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = "id-ID";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e) => {
        setInput(prev => prev + e.results[0][0].transcript);
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognition) return alert("Browser tidak mendukung voice input.");
    if (isListening) { recognition.stop(); setIsListening(false); }
    else { recognition.start(); setIsListening(true); }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex gap-2 items-end">
      {/* Voice Button */}
      <button onClick={toggleVoice}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all"
        style={isListening ? {
          background: 'rgba(232,131,106,0.2)',
          border: '1px solid rgba(232,131,106,0.5)',
          animation: 'glow-pulse 1s ease-in-out infinite',
          color: '#e8836a'
        } : {
          background: 'rgba(74,168,216,0.1)',
          border: '1px solid rgba(74,168,216,0.2)',
          color: 'var(--text-muted)'
        }}>
        {isListening ? '🔴' : '🎤'}
      </button>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "🎤 Mendengarkan..." : "Tulis pesan atau tekan 🎤..."}
          rows={1}
          className="w-full resize-none text-sm py-3 px-4 rounded-xl transition-all"
          style={{
            background: 'rgba(13,33,55,0.6)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isListening ? 'rgba(232,131,106,0.4)' : 'rgba(74,168,216,0.2)'}`,
            color: 'var(--text-primary)',
            outline: 'none',
            maxHeight: '120px',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,255,231,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(74,168,216,0.2)'}
        />
      </div>

      {/* Send Button */}
      <button onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all"
        style={!input.trim() || isLoading ? {
          background: 'rgba(74,168,216,0.1)',
          border: '1px solid rgba(74,168,216,0.1)',
          color: 'var(--text-muted)',
          cursor: 'not-allowed'
        } : {
          background: 'linear-gradient(135deg, var(--ocean-shallow), var(--biolum))',
          border: 'none',
          color: 'var(--ocean-deep)',
          boxShadow: '0 0 16px rgba(0,255,231,0.3)',
          cursor: 'pointer'
        }}>
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : '➤'}
      </button>
    </div>
  );
};

export default ChatInput;