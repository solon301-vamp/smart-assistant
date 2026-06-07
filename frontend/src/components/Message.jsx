import { useState } from "react";
import axios from "axios";

const Message = ({ role, content, id, liked: initialLiked }) => {
  const isUser = role === "user";
  const [liked, setLiked] = useState(initialLiked || false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    if (id) {
      try {
        await axios.post("/api/like", { message_id: id, liked: newLiked });
      } catch (e) {}
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format markdown sederhana
  const formatContent = (text) => {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-message-in group`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
          style={{
            background: 'linear-gradient(135deg, #1e5f8e, #00ffe7)',
            boxShadow: '0 0 10px rgba(0,255,231,0.3)'
          }}>
          🌊
        </div>
      )}

      <div className={`max-w-[72%] ${isUser ? '' : ''}`}>
        {/* Bubble */}
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, var(--ocean-shallow), var(--sky-horizon))',
            color: 'var(--foam-white)',
            borderRadius: '18px 18px 4px 18px',
            boxShadow: '0 4px 16px rgba(30,95,142,0.3)',
          } : {
            background: 'rgba(13,33,55,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(74,168,216,0.2)',
            color: 'var(--text-primary)',
            borderRadius: '18px 18px 18px 4px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
          <div dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            style={{ lineHeight: '1.6' }} />
        </div>

        {/* Action buttons (only for AI messages) */}
        {!isUser && (
          <div className="flex gap-2 mt-1.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={{
                background: 'rgba(74,168,216,0.1)',
                color: copied ? 'var(--biolum)' : 'var(--text-muted)',
                border: '1px solid rgba(74,168,216,0.2)'
              }}>
              {copied ? '✓ Tersalin' : '📋 Salin'}
            </button>
            <button onClick={handleLike}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={{
                background: liked ? 'rgba(0,255,231,0.1)' : 'rgba(74,168,216,0.1)',
                color: liked ? 'var(--biolum)' : 'var(--text-muted)',
                border: `1px solid ${liked ? 'rgba(0,255,231,0.3)' : 'rgba(74,168,216,0.2)'}`
              }}>
              {liked ? '💙 Disukai' : '🤍 Suka'}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 mt-1"
          style={{
            background: 'linear-gradient(135deg, var(--seafoam), var(--sky-blue))',
            color: 'var(--ocean-deep)',
          }}>
          U
        </div>
      )}

      <style>{`
        .code-block {
          background: rgba(2,12,27,0.8);
          border: 1px solid rgba(74,168,216,0.2);
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #87ceeb;
        }
        .inline-code {
          background: rgba(74,168,216,0.15);
          padding: 1px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          color: var(--biolum);
        }
      `}</style>
    </div>
  );
};

export default Message;