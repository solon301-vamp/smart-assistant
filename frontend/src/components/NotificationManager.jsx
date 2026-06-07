import { useEffect } from "react";
import axios from "axios";

const NotificationManager = ({ sessionId }) => {
  useEffect(() => {
    // Minta izin notifikasi
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cek jadwal setiap menit
    const checkSchedules = async () => {
      if (Notification.permission !== "granted") return;

      try {
        const res = await axios.get(`/api/schedules/${sessionId}`);
        const schedules = res.data;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        schedules.forEach(s => {
          if (s.date === todayStr && s.time === currentTime && !s.is_done && s.notify) {
            new Notification(`🌊 Coral Reminder`, {
              body: `${s.title}${s.description ? ' - ' + s.description : ''}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }
        });
      } catch (e) {}
    };

    const interval = setInterval(checkSchedules, 60000);
    checkSchedules(); // Cek langsung saat mount

    return () => clearInterval(interval);
  }, [sessionId]);

  return null; // Komponen ini tidak render apapun
};

export default NotificationManager;