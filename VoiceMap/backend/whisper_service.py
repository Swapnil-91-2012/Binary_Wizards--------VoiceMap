import whisper
import os

# Load Whisper model ONCE (important)
# Options: tiny, base, small, medium
model = whisper.load_model("base")

def transcribe(audio_path: str):
    """
    Transcribe audio using local Whisper (no OpenAI).

    Args:
        audio_path (str): Path to audio file

    Returns:
        tuple[str, str]: (text, language)
    """

    if not os.path.exists(audio_path):
        raise FileNotFoundError("Audio file not found")

    result = model.transcribe(
        audio_path,
        fp16=False,       # CPU-safe (Windows)
        language=None,    # auto-detect
        verbose=False
    )

    text = result.get("text", "").strip()
    language = result.get("language")

    if not text:
        raise RuntimeError("Empty transcription result")

    return text, language
