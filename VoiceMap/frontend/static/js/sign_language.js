/**
 * sign_language.js
 *
 * Handles:
 * - Audio recording
 * - File upload
 * - Backend communication
 * - Sequential sign video playback
 *
 * REQUIREMENTS:
 * - window.SIGN_MAP must exist
 */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       ELEMENT REFERENCES
    ========================== */
    const recordButton = document.getElementById("recordButtonSign");
    const uploadInput = document.getElementById("uploadInput");
    const statusDiv = document.getElementById("statusSign");
    const outputContainer = document.getElementById("outputSign");
    const transcribedTextElem = document.getElementById("transcribedText");
    const videoContainer = document.getElementById("videoContainer");

    /* =========================
       SAFETY CHECK
    ========================== */
    if (!window.SIGN_MAP) {
        console.error("SIGN_MAP not loaded. Check signs/sign_map.js");
        statusDiv.textContent = "Sign dictionary failed to load.";
        return;
    }

    const SIGN_MAP = window.SIGN_MAP;

    const recorder = new AudioRecorder();
    let isRecording = false;

    /* =========================
       RECORD BUTTON
    ========================== */
    recordButton.addEventListener("click", async () => {
        if (!isRecording) {
            try {
                await recorder.start();
                isRecording = true;
                updateButton(true);
                statusDiv.textContent = "Recording...";
                resetOutput();
            } catch (err) {
                statusDiv.textContent = err.message;
            }
        } else {
            const audioBlob = await recorder.stop();
            isRecording = false;
            updateButton(false);

            if (!audioBlob) {
                statusDiv.textContent = "No audio captured.";
                return;
            }

            statusDiv.textContent = "Processing audio...";
            sendForProcessing(audioBlob);
        }
    });

    /* =========================
       FILE UPLOAD
    ========================== */
    uploadInput.addEventListener("change", () => {
        const file = uploadInput.files[0];
        if (!file) return;

        resetOutput();
        statusDiv.textContent = "Processing audio file...";
        sendForProcessing(file);
    });

    /* =========================
       UI HELPERS
    ========================== */
    function updateButton(recording) {
        recordButton.textContent = recording
            ? "Stop Recording"
            : "Start Recording";

        recordButton.classList.toggle("recording", recording);
    }

    function resetOutput() {
        outputContainer.style.display = "none";
        transcribedTextElem.textContent = "";
        videoContainer.innerHTML = "";
    }

    /* =========================
       BACKEND CALL
    ========================== */
    async function sendForProcessing(audioData) {
        const formData = new FormData();
        formData.append("audio", audioData, "audio.webm");

        try {
            const response = await fetch("/sign-language", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Processing failed");
            }

            statusDiv.textContent = "Transcription complete";
            displaySignVideos(result.transcription);

        } catch (err) {
            console.error(err);
            statusDiv.textContent = "Error: " + err.message;
            resetOutput();
        }
    }

    /* =========================
       SIGN VIDEO PLAYER
    ========================== */
    function displaySignVideos(text) {
        transcribedTextElem.textContent = text;
        outputContainer.style.display = "block";
        videoContainer.innerHTML = "";

        const words = text
            .toUpperCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/);

        let index = 0;

        function playNext() {
            if (index >= words.length) return;

            const word = words[index++];
            const fileName = SIGN_MAP[word];

            if (!fileName) {
                playNext(); // skip unknown words
                return;
            }

            const video = document.createElement("video");
            video.src = `/static/signs/${fileName}`;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.controls = false;
            video.style.width = "260px";
            video.style.margin = "8px";

            video.onended = playNext;

            videoContainer.appendChild(video);
        }

        playNext();
    }
});
