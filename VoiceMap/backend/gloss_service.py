# gloss_service.py
# Converts text into sign-language gloss tokens and maps to local videos

import os
import re

SIGNS_FOLDER = os.path.join(os.path.dirname(__file__), "signs")

# Words to REMOVE completely
STOPWORDS = {
    "A", "AN", "THE", "TO", "OF", "IN", "ON", "AT",
    "IS", "AM", "ARE", "WAS", "WERE", "BE", "BEEN",
    "DO", "DID", "DOES"
}

# Gloss normalization
GLOSS_MAP = {
    "I": "ME",
    "ME": "ME",
    "MY": "ME",
    "YOU": "YOU",
    "WE": "WE",
    "HE": "HE",
    "SHE": "SHE",
    "THEY": "THEY",

    "EATING": "EAT",
    "DRINKING": "DRINK",
    "WANTED": "WANT",
    "HAVING": "HAVE",
    "THANKS": "THANK",
}
def clean_text(text):
    text = text.upper()
    text = re.sub(r"[^A-Z\s]", "", text)
    return text.split()

def gloss_text(text):
    words = clean_text(text)
    gloss_tokens = []

    for word in words:
        if word in STOPWORDS:
            continue

        gloss = GLOSS_MAP.get(word, word)
        gloss_tokens.append(gloss)

    return gloss_tokens

def map_gloss_to_videos(gloss_tokens):
    videos = []

    for token in gloss_tokens:
        video_path = os.path.join(SIGNS_FOLDER, f"{token}.mp4")
        if os.path.exists(video_path):
            videos.append(f"/signs/{token}.mp4")
        else:
            continue

    return videos
