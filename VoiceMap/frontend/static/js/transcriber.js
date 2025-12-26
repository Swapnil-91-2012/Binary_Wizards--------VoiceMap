/**
 * transcriber.js
 *
 * Handles:
 * - Audio recording
 * - File upload
 * - Whisper transcription
 */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       ELEMENT REFERENCES
    ========================== */
    const recordButton = document.getElementById("recordButton");
    const uploadInput = document.getElementById("uploadInput")document.addEventListener("DOMContentLoaded", () => {

  const recordButton = document.getElementById("recordButton");
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadInput = document.getElementById("uploadInput");
  const statusDiv = document.getElementById("status");
  const outputText = document.getElementById("outputText");

  if (!recordButton || !uploadBtn || !uploadInput || !statusDiv || !outputText) {
    console.error("Transcriber: Missing DOM elements");
    return;
  }

  const recorder = new AudioRecorder();
  let isRecording = false;

  recordButton.addEventListener("click", async () => {
    if (!isRecording) {
      await recorder.start();
      isRecording = true;
      recordButton.textContent = "STOP RECORDING";
      statusDiv.textContent = "Recording...";
    } else {
      const audioBlob = await recorder.stop();
      isRecording = false;
      recordButton.textContent = "START RECORDING 🎤";

      if (!audioBlob) return;
      sendAudio(audioBlob);
    }
  });

  uploadBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", async () => {
  const file = uploadInput.files[0];
  if (!file) return;

  outputText.textContent = "";

  statusDiv.textContent = "Uploading audio...";

  sendAudio(file);
});


  async function sendAudio(audioData) {
    const formData = new FormData();
    formData.append("audio", audioData);

    try {
      const res = await fetch("/transcribe", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      statusDiv.textContent = "Transcription complete";
      outputText.textContent = data.text || data.transcription || "";

    } catch (err) {
      statusDiv.textContent = err.message;
    }
  }

});
;
    const statusDiv = document.getElementById("status");
    const outputText = document.getElementById("outputText");

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
                outputText.textContent = "";
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

            statusDiv.textContent = "Transcribing audio...";
            sendForTranscription(audioBlob);
        }
    });

    /* =========================
       FILE UPLOAD
    ========================== */
    uploadInput.addEventListener("change", () => {
        const file = uploadInput.files[0];
        if (!file) return;

        outputText.textContent = "";
        statusDiv.textContent = "Transcribing audio file...";
        sendForTranscription(file);
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

    /* =========================
       BACKEND CALL (WHISPER)
    ========================== */

    async function sendForTranscription(audioData) {
    const formData = new FormData();

    if (audioData instanceof File) {
        formData.append("audio", audioData);
    } else {
        formData.append("audio", audioData, "recording.webm");
    }

    try {
        const response = await fetch("/transcribe", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        
        // Log this to your console (F12) to see exactly what the server says
        console.log("Server data:", result); 

        if (!response.ok) {
            throw new Error(result.error || "Transcription failed");
        }

        statusDiv.textContent = "Transcription complete";

        /** * FIX: We check multiple possible keys (text, transcription, or message) 
         * to ensure the output is not empty.
         */
        const transcriptionText = result.text || result.transcription || result.message;
        
        if (outputText.tagName === 'TEXTAREA') {
            outputText.value = transcriptionText;
        } else {
            outputText.textContent = transcriptionText;
        }

    } catch (err) {
        console.error(err);
        statusDiv.textContent = "Error: " + err.message;
        outputText.textContent = "";
    }
}
});
