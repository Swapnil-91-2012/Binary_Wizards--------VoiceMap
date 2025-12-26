document.addEventListener("DOMContentLoaded", () => {

  const recordButton = document.getElementById("recordButtonSign");
  const uploadBtn = document.getElementById("uploadBtnSign");
  const uploadInput = document.getElementById("uploadSign");
  const statusDiv = document.getElementById("statusSign");
  const videoContainer = document.getElementById("videoContainer");

  if (!recordButton || !uploadBtn || !uploadInput || !statusDiv || !videoContainer) {
    console.error("Sign Language: Missing DOM elements");
    return;
  }

  if (!window.SIGN_MAP) {
    statusDiv.textContent = "Sign map failed to load.";
    return;
  }

  const recorder = new AudioRecorder();
  let isRecording = false;

  recordButton.addEventListener("click", async () => {
    if (!isRecording) {
      try {
        await recorder.start();
        isRecording = true;
        recordButton.textContent = "STOP RECORDING";
        statusDiv.textContent = "Recording...";
      } catch (err) {
        statusDiv.textContent = err.message;
      }
    } else {
      const audioBlob = await recorder.stop();
      isRecording = false;
      recordButton.textContent = "START RECORDING 🎤";

      if (!audioBlob) return;

      statusDiv.textContent = "Processing audio...";
      sendAudio(audioBlob);
    }
  });

  uploadBtn.addEventListener("click", () => uploadInput.click());

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;

    statusDiv.textContent = "Uploading audio...";
    sendAudio(file);
  });

  async function sendAudio(audioData) {
    const formData = new FormData();
    formData.append("audio", audioData);

    try {
      const res = await fetch("/sign-language", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");

      playSigns(data.transcription);

    } catch (err) {
      statusDiv.textContent = err.message;
    }
  }

  function playSigns(text) {
    videoContainer.innerHTML = "";
    const words = text.toUpperCase().split(/\s+/);
    let index = 0;

    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.style.width = "100%";

    videoContainer.appendChild(video);

    function next() {
      if (index >= words.length) {
        statusDiv.textContent = "Playback finished";
        return;
      }

      const file = window.SIGN_MAP[words[index++]];
      if (!file) return next();

      video.src = `/static/signs/${file}`;
      video.play();
      video.onended = next;
    }

    next();
  }

});
