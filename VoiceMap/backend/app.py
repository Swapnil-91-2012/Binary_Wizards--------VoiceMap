from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import os
import uuid

import whisper_service
import gloss_service   
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")


UPLOAD_FOLDER = os.path.join(app.root_path, "uploads")
ALLOWED_EXTENSIONS = {"mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- HELPERS ---------- #

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_temp_file(file):
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)
    return path

def transcribe_and_validate(audio_path):
    text, language = whisper_service.transcribe(audio_path)

    if language not in ["en", "hi"]:
        raise ValueError(f"Unsupported language: {language}")

    return text, language

# ---------- ROUTES ---------- #

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400

    file = request.files['audio']
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    path = save_temp_file(file)

    try:
        text, language = transcribe_and_validate(path)
        return jsonify({"transcription": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            os.remove(path)


@app.route("/signs/<path:filename>")
def serve_signs(filename):
    return send_from_directory("signs", filename)

@app.route("/sign-language", methods=["POST"])
def generate_sign_language():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    file = request.files["audio"]

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    path = save_temp_file(file)

    try:
        text, language = transcribe_and_validate(path)

        gloss_tokens = gloss_service.gloss_text(text)
        video_sequence = gloss_service.map_gloss_to_videos(gloss_tokens)

        return jsonify({
            "transcription": text,
            "gloss": gloss_tokens,
            "videos": video_sequence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(path):
            os.remove(path)

# ---------- RUN ---------- #

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
