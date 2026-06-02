const MODES = [
  { id: "general",    label: "💬 General",    desc: "Asisten umum" },
  { id: "tutor",      label: "📚 Tutor",      desc: "Jelaskan konsep" },
  { id: "translator", label: "🌐 Translator", desc: "Terjemahkan teks" },
  { id: "coding",     label: "💻 Coding",     desc: "Bantu programming" },
];

const ModeSelector = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          title={mode.desc}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentMode === mode.id
              ? "bg-blue-500 text-white shadow-md scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;