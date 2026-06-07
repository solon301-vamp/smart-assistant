import { useState, useEffect } from "react";
import axios from "axios";

const CATEGORIES = {
  umum:     { color: '#4aa8d8', icon: '📌' },
  kuliah:   { color: '#a8dce0', icon: '📚' },
  tugas:    { color: '#f4c842', icon: '📝' },
  personal: { color: '#e8836a', icon: '🌊' },
};

const Calendar = ({ sessionId, isOpen, onClose }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [schedules, setSchedules]     = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '09:00', category: 'umum'
  });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Date(year, month).toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  useEffect(() => {
    if (isOpen) loadSchedules();
  }, [isOpen, month, year]);

  const loadSchedules = async () => {
    try {
      const res = await axios.get(`/api/schedules/${sessionId}`);
      setSchedules(res.data);
    } catch (e) {}
  };

  const getSchedulesForDay = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return schedules.filter(s => s.date === dateStr);
  };

  const handleAddSchedule = async () => {
    if (!form.title || !form.date) return;
    try {
      await axios.post('/api/schedules', { ...form, session_id: sessionId });
      setShowForm(false);
      setForm({ title: '', description: '', date: '', time: '09:00', category: 'umum' });
      loadSchedules();
    } catch (e) {}
  };

  const handleToggleDone = async (id, isDone) => {
    await axios.patch(`/api/schedules/${id}`, { is_done: !isDone });
    loadSchedules();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/schedules/${id}`);
    loadSchedules();
  };

  const selectedDateStr = selectedDate
    ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`
    : null;

  const selectedSchedules = selectedDate ? getSchedulesForDay(selectedDate) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,12,27,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden flex"
        style={{
          background: 'rgba(10,22,40,0.95)',
          border: '1px solid rgba(74,168,216,0.2)',
          boxShadow: '0 0 60px rgba(0,255,231,0.1)',
          maxHeight: '90vh'
        }}>

        {/* Calendar Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentDate(new Date(year, month-1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'rgba(74,168,216,0.1)', color: 'var(--sky-light)' }}>
              ‹
            </button>
            <h2 className="font-display text-base capitalize" style={{ color: 'var(--sky-dawn)' }}>
              {monthName}
            </h2>
            <button onClick={() => setCurrentDate(new Date(year, month+1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'rgba(74,168,216,0.1)', color: 'var(--sky-light)' }}>
              ›
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
              <div key={d} className="text-center text-xs py-1 font-medium"
                style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const daySchedules = getSchedulesForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDate;

              return (
                <button key={day} onClick={() => setSelectedDate(day)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all relative"
                  style={{
                    background: isSelected
                      ? 'rgba(0,255,231,0.15)'
                      : isToday
                        ? 'rgba(74,168,216,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    border: isSelected
                      ? '1px solid rgba(0,255,231,0.4)'
                      : isToday
                        ? '1px solid rgba(74,168,216,0.3)'
                        : '1px solid rgba(255,255,255,0.05)',
                    color: isSelected ? 'var(--biolum)' : isToday ? 'var(--sky-light)' : 'var(--text-secondary)',
                  }}>
                  <span className="font-medium">{day}</span>
                  {daySchedules.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {daySchedules.slice(0,3).map((s, idx) => (
                        <span key={idx} className="w-1 h-1 rounded-full"
                          style={{ background: CATEGORIES[s.category]?.color || '#4aa8d8' }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add button */}
          <button onClick={() => {
            setForm(f => ({ ...f, date: selectedDateStr || '' }));
            setShowForm(true);
          }}
            className="w-full mt-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--ocean-shallow), var(--sky-horizon))',
              color: 'var(--foam-white)'
            }}>
            + Tambah Jadwal
          </button>
        </div>

        {/* Right panel: selected day schedules */}
        <div className="w-72 flex flex-col border-l overflow-hidden"
          style={{ borderColor: 'rgba(74,168,216,0.1)' }}>

          <div className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(74,168,216,0.1)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--sky-dawn)' }}>
              {selectedDate ? `${selectedDate} ${new Date(year, month).toLocaleString('id-ID', { month: 'long' })}` : 'Pilih tanggal'}
            </h3>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedSchedules.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Tidak ada jadwal
              </p>
            ) : selectedSchedules.map(s => (
              <div key={s.id} className="rounded-xl p-3 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${CATEGORIES[s.category]?.color || '#4aa8d8'}40`,
                  opacity: s.is_done ? 0.5 : 1
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span>{CATEGORIES[s.category]?.icon}</span>
                      <span className="text-xs font-medium"
                        style={{
                          color: 'var(--text-primary)',
                          textDecoration: s.is_done ? 'line-through' : 'none'
                        }}>
                        {s.title}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      🕐 {s.time}
                    </div>
                    {s.description && (
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {s.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggleDone(s.id, s.is_done)}
                      className="w-6 h-6 rounded-lg text-xs flex items-center justify-center"
                      style={{ background: 'rgba(0,255,231,0.1)', color: 'var(--biolum)' }}>
                      {s.is_done ? '↺' : '✓'}
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="w-6 h-6 rounded-lg text-xs flex items-center justify-center"
                      style={{ background: 'rgba(232,131,106,0.1)', color: '#e8836a' }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-96 rounded-2xl p-6"
            style={{ background: 'rgba(10,22,40,0.98)', border: '1px solid rgba(74,168,216,0.3)' }}>
            <h3 className="font-display text-sm mb-4" style={{ color: 'var(--sky-dawn)' }}>
              Tambah Jadwal Baru
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Judul *', key: 'title', type: 'text', placeholder: 'Nama jadwal...' },
                { label: 'Tanggal *', key: 'date', type: 'date' },
                { label: 'Waktu', key: 'time', type: 'time' },
                { label: 'Deskripsi', key: 'description', type: 'text', placeholder: 'Keterangan...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    {field.label}
                  </label>
                  <input type={field.type} value={form[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(74,168,216,0.2)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }} />
                </div>
              ))}

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  Kategori
                </label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, category: key }))}
                      className="px-3 py-1 rounded-xl text-xs transition-all"
                      style={{
                        background: form.category === key ? `${val.color}30` : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${form.category === key ? val.color : 'rgba(255,255,255,0.1)'}`,
                        color: form.category === key ? val.color : 'var(--text-muted)'
                      }}>
                      {val.icon} {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                Batal
              </button>
              <button onClick={handleAddSchedule}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, var(--ocean-shallow), var(--biolum))',
                  color: 'var(--ocean-deep)'
                }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;