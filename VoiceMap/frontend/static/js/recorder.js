/**
 * Recorder.js
 * 
 * Provides a simple interface for recording audio using the MediaRecorder API.
 * It handles starting, stopping, and retrieving the audio data.
 */
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioFile = null;
        this.stream = null;
    }

    /**
     * Starts the audio recording process.
     * @returns {Promise<void>} A promise that resolves when recording starts, or rejects if permission is denied.
     */
    async start() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            console.warn("Recording is already in progress.");
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioChunks = [];

            this.mediaRecorder = new MediaRecorder(this.stream);

            this.mediaRecorder.addEventListener("dataavailable", event => {
                this.audioChunks.push(event.data);
            });

            this.mediaRecorder.start();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw new Error("Microphone access was denied. Please allow microphone access in your browser settings.");
        }
    }

    /**
     * Stops the audio recording.
     * @returns {Promise<File>} A promise that resolves with the recorded audio as a File.
     */
    stop() {
        return new Promise(resolve => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                console.warn("Recording is not active.");
                resolve(null);
                return;
            }

            this.mediaRecorder.addEventListener("stop", () => {
                this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

                // 🔧 FIX: convert Blob → File with filename
                this.audioFile = new File(
                    [this.audioBlob],
                    "recording.webm",
                    { type: "audio/webm" }
                );

                this.stream.getTracks().forEach(track => track.stop());
                resolve(this.audioFile);
            });

            this.mediaRecorder.stop();
        });
    }

    /**
     * Gets the most recently recorded audio File.
     * @returns {File|null} The audio file, or null if no recording has been made.
     */
    getAudioBlob() {
        return this.audioFile;
    }
}
