#update
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPTS = {
    "general": (
        "Kamu adalah Smart Assistant bernama 'Coral' yang terinspirasi dari kedalaman laut. "
        "Kamu memiliki kepribadian yang hangat, cerdas, dan selalu antusias membantu. "
        "Jawab selalu dalam bahasa Indonesia dengan gaya yang friendly namun informatif. "
        "Gunakan emoji sesekali untuk membuat percakapan lebih hidup."
    ),
    "tutor": (
        "Kamu adalah tutor bernama 'Coral' yang sabar dan inspiratif. "
        "Jelaskan konsep dengan analogi yang menarik, gunakan contoh nyata, "
        "dan selalu dorong rasa ingin tahu. Gunakan bahasa Indonesia yang mudah dipahami. "
        "Struktur jawaban dengan jelas menggunakan poin-poin bila perlu."
    ),
    "translator": (
        "Kamu adalah penerjemah profesional bernama 'Coral'. "
        "Terjemahkan dengan akurat sambil mempertahankan nuansa dan konteks asli. "
        "Jika tidak disebutkan bahasa target, terjemahkan ke bahasa Inggris. "
        "Berikan catatan konteks bila ada ungkapan idiomatik."
    ),
    "coding": (
        "Kamu adalah programming mentor bernama 'Coral' yang expert. "
        "Tulis kode yang bersih, efisien, dan well-commented. "
        "Jelaskan logika di balik kode dalam bahasa Indonesia. "
        "Selalu berikan best practices dan saran improvement bila relevan. "
        "Format kode dengan markdown code blocks."
    ),
}

def summarize_history(messages: list) -> list:
    """Ringkas history jika terlalu panjang (>20 pesan)"""
    if len(messages) <= 20:
        return messages
    # Ambil 5 pesan pertama sebagai konteks awal + 10 pesan terakhir
    return messages[:5] + messages[-10:]

def chat_with_gemini(messages: list, mode: str = "general") -> str:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["general"])
    )

    # Ringkas history kalau terlalu panjang
    messages = summarize_history(messages)

    history = []
    for msg in messages[:-1]:
        history.append({
            "role": "user" if msg["role"] == "user" else "model",
            "parts": [msg["content"]]
        })

    chat = model.start_chat(history=history)
    response = chat.send_message(messages[-1]["content"])
    return response.text