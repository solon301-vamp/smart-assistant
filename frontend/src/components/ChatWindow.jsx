import { useEffect, useRef } from "react";
import Message from "./Message";

const ChatWindow = ({ messages, isLoading }) => {
  const bottomRef = useRef(null);

  // Auto scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Pesan kosong */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
          <div className="text-5xl">🤖</div>
          <p className="text-lg font-medium">Smart Assistant siap membantu!</p>
          <p className="text-sm">Pilih mode di atas lalu mulai percakapan</p>
        </div>
      )}

      {/* List pesan */}
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} content={msg.content} />
      ))}

      {/* Loading bubble */}
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0 mt-1">
            AI
          </div>
          <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}/>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}/>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}/>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;