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
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

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
     * @returns {Promise<Blob>} A promise that resolves with the recorded audio as a Blob.
     */
    stop() {
        return new Promise(resolve => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                console.warn("Recording is not active.");
                resolve(null);
                return;
            }

            this.mediaRecorder.addEventListener("stop", () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                // Stop all tracks on the stream to release the microphone
                this.stream.getTracks().forEach(track => track.stop());
                resolve(this.audioBlob);
            });

            this.mediaRecorder.stop();
        });
    }

    /**
     * Gets the most recently recorded audio Blob.
     * @returns {Blob|null} The audio blob, or null if no recording has been made.
     */
    getAudioBlob() {
        return this.audioBlob;
    }
}
