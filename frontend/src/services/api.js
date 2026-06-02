import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export const sendMessage = async (message, sessionId, mode) => {
  const response = await axios.post(`${API_BASE}/chat`, {
    message,
    session_id: sessionId,
    mode,
  });
  return response.data;
};

export const getHistory = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/history/${sessionId}`);
  return response.data;
};