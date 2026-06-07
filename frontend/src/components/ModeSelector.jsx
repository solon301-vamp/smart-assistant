const MODES = [
  { id: "general",    label: "Umum",       icon: "🌊", desc: "Tanya apa saja" },
  { id: "tutor",      label: "Tutor",      icon: "📚", desc: "Belajar bersama" },
  { id: "translator", label: "Translator", icon: "🌐", desc: "Terjemahkan teks" },
  { id: "coding",     label: "Coding",     icon: "💻", desc: "Bantu programming" },
];

const ModeSelector = ({ currentMode, onModeChange }) => (
  <div className="flex gap-2 flex-wrap">
    {MODES.map(mode => (
      <button key={mode.id} onClick={() => onModeChange(mode.id)} title={mode.desc}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
        style={currentMode === mode.id ? {
          background: 'rgba(0,255,231,0.15)',
          border: '1px solid rgba(0,255,231,0.4)',
          color: 'var(--biolum)',
          boxShadow: '0 0 12px rgba(0,255,231,0.2)'
        } : {
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.6)',
        }}>
        <span>{mode.icon}</span>
        <span>{mode.label}</span>
      </button>
    ))}
  </div>
);

export default ModeSelector;