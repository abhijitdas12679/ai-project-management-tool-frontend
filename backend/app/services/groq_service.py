import os
import json
import re
from typing import Any, Dict

from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "Paset_API_Key_Here")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

_client = None


def _get_client():
    """Lazily create the Groq client so the app can still start without a key."""
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            return None
        from groq import Groq

        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def _extract_json(text: str) -> Dict[str, Any]:
    """Extract the first valid JSON object/array found in a model response."""
    text = text.strip()
    # Strip markdown code fences if present
    text = re.sub(r"^```(json)?", "", text.strip())
    text = re.sub(r"```$", "", text.strip())
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback: find the widest {...} or [...] block
    match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError as e:
            raise ValueError(f"AI response was not valid JSON: {e}")
    raise ValueError("AI response did not contain JSON")


def call_groq_json(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Calls the Groq chat completion API and returns the response parsed as JSON.
    Raises RuntimeError if the API key is missing or the call fails.
    """
    client = _get_client()
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY is not configured on the backend. "
            "Set it in your .env file to enable AI features."
        )

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content
        return _extract_json(raw)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Groq API call failed: {exc}") from exc
