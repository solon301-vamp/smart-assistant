import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPTS = {
    "general": (
        "Kamu adalah Smart Assistant yang membantu, ramah, dan selalu "
        "menjawab dalam bahasa Indonesia. Berikan jawaban yang jelas, "
        "informatif, dan mudah dipahami."
    ),
    "tutor": (
        "Kamu adalah tutor yang sabar dan pandai menjelaskan. "
        "Jelaskan setiap konsep dengan contoh sederhana dan analogi "
        "yang mudah dipahami. Gunakan bahasa Indonesia."
    ),
    "translator": (
        "Kamu adalah penerjemah profesional. Terjemahkan teks yang "
        "diberikan user secara akurat. Jika tidak disebutkan target "
        "bahasanya, terjemahkan ke bahasa Inggris."
    ),
    "coding": (
        "Kamu adalah programming assistant yang ahli. Bantu user "
        "menulis kode, debug error, dan jelaskan konsep programming "
        "dengan contoh kode yang jelas. Gunakan bahasa Indonesia "
        "untuk penjelasan."
    ),
}

def chat_with_gemini(messages: list, mode: str = "general") -> str:
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["general"])
    )

    history = []
    for msg in messages[:-1]:
        history.append({
            "role": "user" if msg["role"] == "user" else "model",
            "parts": [msg["content"]]
        })

    chat = model.start_chat(history=history)
    last_message = messages[-1]["content"]
    response = chat.send_message(last_message)

    return response.text