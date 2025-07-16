import React, { useRef, useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState("en");
  const youtubeUrlRef = useRef();
  const fileInputRef = useRef();

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  }

  function extractVideoId(url) {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  }

  // Remove API_KEYS and AUDIO_API_KEYS from frontend for security
  // All RapidAPI requests are now proxied through /api/rapidapi

  async function fetchWithKeyRotation(videoId, lang) {
    try {
      const response = await fetch('/api/rapidapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'transcript', videoId, lang }),
      });
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (err) {
      throw err;
    }
  }

  async function downloadAudioWithRapidAPI(videoId) {
    try {
      const response = await fetch('/api/rapidapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'audio', videoId }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      if (!data.file) throw new Error('No audio file URL in API response.');
      const audioRes = await fetch(data.file);
      if (!audioRes.ok) throw new Error('Failed to download audio file.');
      const blob = await audioRes.blob();
      return blob;
    } catch (err) {
      throw err;
    }
  }

  async function transcribeAudioBlob(audioBlob, lang) {
    setLoading(true);
    setTranscript("Uploading audio and transcribing with Whisper...");
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("lang", lang);
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      if (data.transcript) {
        setTranscript(data.transcript + "\n\n(Transcribed by Whisper)");
      } else {
        showToast("No transcript returned.");
        setTranscript("");
      }
    } catch (err) {
      showToast("Audio transcription error: " + (err.message || err));
      setTranscript("");
    }
    setLoading(false);
  }

  async function handleYoutubeSubmit(e) {
    e.preventDefault();
    setTranscript("");
    setLoading(true);
    const url = youtubeUrlRef.current.value.trim();
    if (!url) {
      showToast("Please enter a YouTube URL.");
      setLoading(false);
      return;
    }
    const videoId = extractVideoId(url);
    if (!videoId) {
      setTranscript("Invalid YouTube URL.");
      setLoading(false);
      return;
    }
    setTranscript("Loading...");
    let rapidApiLang = lang;
    if (lang === "zh-Hant") rapidApiLang = "zh-HK";
    try {
      const data = await fetchWithKeyRotation(videoId, rapidApiLang);
      if (Array.isArray(data) && data[0] && data[0].transcriptionAsText) {
        setTranscript(data[0].transcriptionAsText);
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore, try next step
    }
    try {
      setTranscript("Trying to download audio for Whisper transcription...");
      const audioBlob = await downloadAudioWithRapidAPI(videoId);
      await transcribeAudioBlob(audioBlob, lang);
      setLoading(false);
      return;
    } catch (err) {
      showToast("Automatic audio download failed: " + (err.message || err));
      setTranscript("");
    }
    setLoading(false);
  }

  async function handleAudioUpload(e) {
    e.preventDefault();
    setTranscript("");
    const files = fileInputRef.current.files;
    if (!files || !files[0]) {
      showToast("Please select an audio file.");
      return;
    }
    await transcribeAudioBlob(files[0], lang);
  }

  return (
    <div className="container">
      <h1>Quam Youtube Transcript</h1>
      <div className="card">
        <div className="form-modern">
          <div style={{ marginBottom: 16, color: "#444", fontSize: "1.05rem" }}>
            Enter a YouTube URL <b>or</b> upload an audio file below. Pick one method to get your transcript.
          </div>
          <form onSubmit={handleYoutubeSubmit}>
            <div className="input-group">
              <input
                type="text"
                ref={youtubeUrlRef}
                placeholder="Input the YouTube URL"
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label htmlFor="language-select">Transcript Language:</label>
              <select
                id="language-select"
                value={lang}
                onChange={e => setLang(e.target.value)}
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="zh-Hant">Cantonese</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              Get Transcript from YouTube
            </button>
          </form>
        </div>
        <div id="manual-upload-section" style={{ marginTop: 20 }}>
          <form onSubmit={handleAudioUpload}>
            <div className="input-group">
              <label htmlFor="audio-file">
                Or upload audio file (mp3, wav, m4a):
              </label>
              <input
                type="file"
                id="audio-file"
                accept="audio/*"
                ref={fileInputRef}
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              Transcribe Uploaded Audio
            </button>
          </form>
        </div>
        <div className="transcript-label">
          Transcript
          {loading && (
            <span id="whisper-loading">
              <span
                className="spinner"
                style={{
                  display: "inline-block",
                  width: 18,
                  height: 18,
                  border: "3px solid #007bff",
                  borderTop: "3px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  verticalAlign: "middle",
                  marginLeft: 8,
                }}
              ></span>
            </span>
          )}
        </div>
        <div id="transcript-box" className="transcript-box">
          {transcript}
        </div>
      </div>
      {toast && <div className="toast show">{toast}</div>}
      <footer
        style={{
          textAlign: "center",
          marginTop: 32,
          color: "#888",
          fontSize: "0.95rem",
        }}
      >
        2025 @ Made with ❤️ from iDDY
      </footer>
      <style jsx>{`
        .toast {
          position: fixed;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          min-width: 240px;
          max-width: 90vw;
          background: #ff4d4f;
          color: #fff;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          opacity: 1;
          pointer-events: auto;
          z-index: 9999;
          transition: opacity 0.4s, top 0.4s;
        }
        .toast.show {
          opacity: 1;
          pointer-events: auto;
          top: 56px;
        }
      `}</style>
    </div>
  );
} 