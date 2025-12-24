# VoiceMap

VoiceMap is a web-based application designed to improve accessibility by converting **audio files into text** and further translating that text into **sign language representations**. The system combines speech-to-text transcription using **OpenAI Whisper** with text glossing and sign mapping to visually represent language for hearing- and speech-impaired users.

---

## 🚀 Features

### 1. Transcriber Mode

* Upload an audio file (e.g., `.wav`, `.mp3`).
* Uses **Whisper** on the backend to transcribe speech into text.
* Displays the transcribed text on the frontend.

### 2. Sign Language Mode

* Takes the transcribed text from Transcriber Mode.
* Converts the text into **glossed form** (simplified grammatical structure suitable for sign language).
* Maps each letter/word to corresponding **sign language videos**.
* Displays sign language videos sequentially for the full sentence.

All sign language videos are stored locally in the `signs/` directory.

---

## 🗂️ Project Structure

```
VoiceMap/
│
├── backend/
│   ├── venv/                   # Python virtual environment
│   ├── app.py                  # Main Flask application
│   ├── whisper_service.py      # Handles audio-to-text using Whisper
│   ├── gloss_service.py        # Converts text to gloss format
│   ├── requirements.txt        # Backend dependencies
│
├── frontend/
│   ├── css/
│   │   └── style.css           # Frontend styling
│   │
│   ├── static/
│   │   ├── images/             # UI images and logos
│   │   │   ├── Sign_Language.png
│   │   │   ├── Transcriber.png
│   │   │   └── VoiceMap_logo.jpeg
│   │   │
│   │   ├── js/
│   │   |   ├── recorder.js        # Handles audio recording
│   │   |   ├── transcriber.js     # Handles audio upload & transcription
|   |   |   ├── sign_language.js   # Handles glossing & sign flow
│   │   |
│   |   └── signs/
│   │       ├── sign_map.js         # Maps letters/words to sign videos
│   │       └── *.mp4 / *.webm      # Sign language videos
│   │
│   ├── index.html              # Landing page
│   ├── transcriber.html        # Transcriber UI
│   └── sign_language.html      # Sign language UI
│
└── README.md                   # Project documentation
```

---

## ⚙️ How It Works

### Step 1: Audio Transcription

1. User uploads an audio file via **Transcriber Mode**.
2. The frontend sends the audio file to the backend API.
3. `whisper_service.py` processes the audio using Whisper.
4. Transcribed text is returned and displayed.

### Step 2: Glossing

1. User switches to **Sign Language Mode**.
2. Transcribed text is sent to `gloss_service.py`.
3. Text is converted into a **glossed sentence** suitable for sign language.

### Step 3: Sign Mapping

1. Glossed text is split into letters or tokens.
2. `sign_map.js` maps each token to a corresponding sign video.
3. Videos from the `signs/` folder are played sequentially.

---

## 🧠 Technologies Used

* **Backend**: Python, Flask
* **Speech-to-Text**: OpenAI Whisper
* **Frontend**: HTML, CSS, JavaScript
* **Media Handling**: HTML5 Audio & Video APIs

---

## 🛠️ Setup Instructions

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python app.py
```

### Frontend Setup

* Open `frontend/index.html` in a browser
* Ensure the backend server is running

---

## 📁 Sign Language Assets

* All sign language videos are stored in:

  ```
  frontend/signs/
  ```
* `sign_map.js` defines the mapping between letters/words and video filenames.
* Ensure filenames in `sign_map.js` exactly match the video files.

---

## 🌟 Future Improvements

* Word-level sign support (instead of letter-level only)
* Sentence-level sign animations
* Live microphone input
* Multilingual support

---

## 📄 License

This project is intended for educational and accessibility-focused use.

---

## 🙌 Acknowledgements

* OpenAI Whisper for speech recognition
* Sign language datasets and open educational resources

---

**VoiceMap — Bridging Speech and Sign Language**
