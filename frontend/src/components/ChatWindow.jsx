import { useEffect, useRef } from "react";
import Message from "./Message";

const ChatWindow = ({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,231,0.5))' }}>
            🌊
          </div>
          <h2 className="font-display text-xl" style={{ color: 'var(--sky-dawn)' }}>
            Selamat Datang di Coral
          </h2>
          <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Asisten cerdasmu yang terinspirasi dari kedalaman samudra. Pilih mode dan mulai percakapan!
          </p>
          <div className="flex gap-3 mt-2">
            {['💬 Tanya apa saja', '📚 Belajar bersama', '🌐 Terjemahkan', '💻 Bantu coding'].map(tip => (
              <span key={tip} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(74,168,216,0.1)', color: 'var(--sky-light)', border: '1px solid rgba(74,168,216,0.2)' }}>
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <Message key={i} role={msg.role} content={msg.content} id={msg.id} liked={msg.liked} />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e5f8e, #00ffe7)', boxShadow: '0 0 10px rgba(0,255,231,0.3)' }}>
            🌊
          </div>
          <div className="px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(13,33,55,0.8)', border: '1px solid rgba(74,168,216,0.2)' }}>
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full"
                  style={{
                    background: 'var(--biolum)',
                    animation: `typing-dot 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    display: 'inline-block'
                  }} />
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;