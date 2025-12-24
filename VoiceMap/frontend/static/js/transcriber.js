/**
 * transcriber.js
 * Handles recording + file upload transcription
 */

document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const uploadInput = document.getElementById('uploadInput');
    const statusDiv = document.getElementById('status');
    const outputText = document.getElementById('outputText');

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    // ---------------- RECORD AUDIO ---------------- //
    recordButton.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    sendForTranscription(audioBlob, 'recording.webm');
                };

                mediaRecorder.start();
                isRecording = true;
                updateButton(true);
                statusDiv.textContent = 'Recording...';
                outputText.textContent = '';
            } catch (error) {
                statusDiv.textContent = `Error: ${error.message}`;
            }
        } else {
            statusDiv.textContent = 'Stopping...';
            mediaRecorder.stop();
            isRecording = false;
            updateButton(false);
        }
    });

    // ---------------- UPLOAD AUDIO ---------------- //
    uploadInput.addEventListener('change', () => {
        const file = uploadInput.files[0];
        if (!file) return;

        statusDiv.textContent = 'Uploading audio file...';
        outputText.textContent = '';

        sendForTranscription(file, file.name);

        // reset input so same file can be uploaded again
        uploadInput.value = '';
    });

    // ---------------- HELPERS ---------------- //
    function updateButton(recording) {
        recordButton.textContent = recording ? 'Stop Recording' : 'Start Recording';
        recordButton.classList.toggle('btn-record-start', !recording);
        recordButton.classList.toggle('btn-record-stop', recording);
    }

    async function sendForTranscription(audioData, filename) {
        const formData = new FormData();
        formData.append('audio', audioData, filename);

        try {
            const response = await fetch('/transcribe', {
                method: 'POST',
                body: formData
            });

            // Parse JSON safely
            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error('Invalid JSON response from server');
            }

            if (!response.ok) {
                throw new Error(result.error || 'Transcription failed');
            }

            statusDiv.textContent = 'Transcription successful';
            outputText.textContent = result.transcription || result.text || '';

        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            outputText.textContent = '';
        }
    }
});
