import { useState } from "react";

const ChatInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    // Enter kirim, Shift+Enter newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
        rows={1}
        className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        style={{ maxHeight: "120px" }}
      />
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
            ...
          </span>
        ) : (
          "Kirim ➤"
        )}
      </button>
    </div>
  );
};

export default ChatInput;