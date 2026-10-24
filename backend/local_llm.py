import os
import sys

MODEL_PATH = os.path.join(os.path.dirname(__file__), "local_model", "qwen2.5-0.5b-instruct-q4_k_m.gguf")

_llm_instance = None
_load_attempted = False


def is_local_model_ready() -> bool:
    return os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 100_000_000


def get_local_llm():
    global _llm_instance, _load_attempted
    if _llm_instance is not None:
        return _llm_instance

    if not is_local_model_ready():
        return None

    if _load_attempted:
        return None

    _load_attempted = True
    try:
        from llama_cpp import Llama
        print(f"🧠 Loading Local AI Model from {MODEL_PATH}...")
        # Apple Silicon ARM NEON CPU execution is ultra-stable, zero Metal-teardown assertions
        _llm_instance = Llama(
            model_path=MODEL_PATH,
            n_ctx=2048,
            n_threads=4,
            n_gpu_layers=0,
            verbose=False,
        )
        print("🚀 Local AI Model (Qwen2.5-0.5B Instruct) loaded onto Apple Silicon CPU!")
        return _llm_instance
    except Exception as e:
        print(f"⚠️ Could not load llama-cpp local model: {e}", file=sys.stderr)
        return None


def generate_local_response(user_query: str, system_prompt: str = None) -> str:
    llm = get_local_llm()
    if llm is None:
        return ""

    if not system_prompt:
        system_prompt = (
            "You are Orbit AI, an expert travel copilot and personal trip recommender for MakeMyTrip. "
            "Respond conversationally in friendly Hinglish (Hindi + English). "
            "Help the user decide their destination, vibe, squad, budget, and stay. "
            "Keep recommendations punchy, energetic, and practical."
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query},
    ]

    try:
        response = llm.create_chat_completion(
            messages=messages,
            max_tokens=256,
            temperature=0.7,
            top_p=0.9,
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Local LLM inference error: {e}", file=sys.stderr)
        return ""
