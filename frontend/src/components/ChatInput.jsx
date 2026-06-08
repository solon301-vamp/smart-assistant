import { useState, useEffect, useRef } from "react";

const ChatInput = ({ onSend, isLoading, lastAIMessage }) => {
  const [input, setInput]           = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [ttsEnabled, setTtsEnabled]   = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const recognitionRef    = useRef(null);
  const wakeRecognitionRef = useRef(null);
  const synthRef          = useRef(window.speechSynthesis);

  // Setup Speech Recognition untuk input biasa
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
      rec.onend   = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  // Setup Wake Word Detection "Hei Coral"
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wakeRec = new SR();
    wakeRec.lang = "id-ID";
    wakeRec.continuous = true;
    wakeRec.interimResults = true;

    wakeRec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript.toLowerCase())
        .join(" ");

      // Deteksi wake word
      if (
        transcript.includes("hei coral") ||
        transcript.includes("hai coral") ||
        transcript.includes("hey coral")
      ) {
        // Aktifkan listening mode
        setIsListening(true);
        wakeRec.stop();

        // Feedback suara
        speak("Saya siap membantu!");

        // Mulai dengarkan perintah
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 1500);
      }
    };

    wakeRec.onend = () => {
      // Restart wake word detection kalau masih aktif
      if (wakeWordActive) {
        try { wakeRec.start(); } catch (e) {}
      }
    };

    wakeRecognitionRef.current = wakeRec;
  }, [wakeWordActive]);

  // Auto TTS saat ada pesan AI baru
  useEffect(() => {
    if (ttsEnabled && lastAIMessage) {
      speak(lastAIMessage);
    }
  }, [lastAIMessage, ttsEnabled]);

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Bersihkan markdown sebelum dibaca
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, 'kode program')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .substring(0, 500); // Max 500 karakter

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang  = "id-ID";
    utterance.rate  = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    // Pilih suara Indonesia kalau tersedia
    const voices = synthRef.current.getVoices();
    const idVoice = voices.find(v =>
      v.lang.includes('id') || v.name.toLowerCase().includes('indonesia')
    );
    if (idVoice) utterance.voice = idVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => {
      setIsSpeaking(false);
      // Restart wake word setelah selesai bicara
      if (wakeWordActive && wakeRecognitionRef.current) {
        try { wakeRecognitionRef.current.start(); } catch (e) {}
      }
    };

    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleWakeWord = () => {
    if (wakeWordActive) {
      wakeRecognitionRef.current?.stop();
      setWakeWordActive(false);
    } else {
      try {
        wakeRecognitionRef.current?.start();
        setWakeWordActive(true);
        speak("Mode wake word aktif. Ucapkan Hei Coral untuk mulai!");
      } catch (e) {
        alert("Tidak bisa mengaktifkan wake word detection.");
      }
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert("Browser tidak mendukung voice input.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleTTS = () => {
    if (isSpeaking) synthRef.current?.cancel();
    setTtsEnabled(!ttsEnabled);
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
    <div className="space-y-2">
      {/* Status bar */}
      <div className="flex gap-2 items-center">
        {/* Wake Word Toggle */}
        <button onClick={toggleWakeWord}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
          style={wakeWordActive ? {
            background: 'rgba(0,255,231,0.15)',
            border: '1px solid rgba(0,255,231,0.4)',
            color: 'var(--biolum)',
            animation: 'glow-pulse 2s ease-in-out infinite'
          } : {
            background: 'rgba(74,168,216,0.1)',
            border: '1px solid rgba(74,168,216,0.2)',
            color: 'var(--text-muted)'
          }}
          title={wakeWordActive ? 'Wake word aktif — ucapkan "Hei Coral!"' : 'Aktifkan wake word'}>
          {wakeWordActive ? '🌊 Mendengarkan...' : '🌊 Hei Coral!'}
        </button>

        {/* TTS Toggle */}
        <button onClick={toggleTTS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all"
          style={ttsEnabled ? {
            background: 'rgba(244,200,66,0.15)',
            border: '1px solid rgba(244,200,66,0.4)',
            color: '#f4c842'
          } : {
            background: 'rgba(74,168,216,0.1)',
            border: '1px solid rgba(74,168,216,0.2)',
            color: 'var(--text-muted)'
          }}
          title={ttsEnabled ? 'Matikan suara Coral' : 'Aktifkan suara Coral'}>
          {isSpeaking ? '🔊 Berbicara...' : ttsEnabled ? '🔊 Suara ON' : '🔇 Suara OFF'}
        </button>
      </div>

      {/* Input row */}
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
            placeholder={
              isListening ? "🎤 Mendengarkan..." :
              wakeWordActive ? '🌊 Ucapkan "Hei Coral!" atau ketik...' :
              "Tulis pesan atau tekan 🎤..."
            }
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
    </div>
  );
};

export default ChatInput;