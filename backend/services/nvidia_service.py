import os
from typing import List, Dict

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")

SYSTEM_PROMPT = """
You are Dr. MediAssist, a professional medical information assistant.
Write in a professional manner using plain text only.
Do not use emojis, decorative symbols, or markdown icons.
Give concise, clinically useful, empathetic answers.

Always use this short format:
1) Clinical Assessment (1-2 sentences)
2) Possible Causes (3 bullets, likely to less likely)
3) Red Flags (bullets for emergency symptoms)
4) What To Do Now (numbered steps for 24-48h self-care)
5) OTC Options (if relevant: medicine, dose, frequency, key caution)
6) When To See A Doctor (urgent / routine / ER)

Rules:
- Never provide a definitive diagnosis.
- Use plain language with brief medical terms in parentheses when useful.
- If non-medical query, reply: "I'm specialized in medical consultations. Please ask me about health-related topics."
- Keep response compact unless user asks for detail.
- Keep the full answer under 160 words when possible.

End every answer with this exact disclaimer:
Medical Disclaimer: This consultation is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified, licensed physician for your specific situation. In case of emergency, call your local emergency services immediately.
"""


async def get_assistant_response(conversation_history: List[Dict[str, str]]) -> str:
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY is not configured.")

    payload = {
        "model": NVIDIA_MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *conversation_history],
        "temperature": 0.1,
        "top_p": 0.6,
        "max_tokens": 160,
        "stream": False,
    }
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{NVIDIA_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            )
            if response.status_code >= 400:
                raise HTTPException(
                    status_code=500,
                    detail=f"NVIDIA API request failed: {response.text}",
                )
            data = response.json()
            final_text = (data.get("choices", [{}])[0].get("message", {}).get("content", "") or "").strip()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to contact NVIDIA API: {exc}") from exc

    if not final_text:
        raise HTTPException(status_code=500, detail="NVIDIA API returned an empty response.")
    return final_text
