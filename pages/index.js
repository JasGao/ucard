import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isBrowser } from "@/lib/chunkAndTranscribe";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState("zh-Hant"); // Default to Cantonese
  const [inputType, setInputType] = useState("url");
  const youtubeUrlRef = useRef();
  const fileInputRef = useRef();
  // Add a state to track if user should be prompted to use Y2Mate
  const [showY2Mate, setShowY2Mate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
      // Use backend proxy to bypass CORS
      const audioRes = await fetch(`/api/proxy-audio?url=${encodeURIComponent(data.file)}`);
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

  async function handleTranscribe(e) {
    e.preventDefault();
    setTranscript("");
    setLoading(true);
    setShowY2Mate(false);
    if (inputType === "url") {
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
        showToast("All API keys are used up. Please manually download the audio and upload it below.");
        setShowY2Mate(true);
        setTranscript("");
      }
      setLoading(false);
    } else if (inputType === "file") {
      const files = fileInputRef.current.files;
      if (!files || !files[0]) {
        showToast("Please select an audio file.");
        setLoading(false);
        return;
      }
      if (!isBrowser()) {
        setError("Audio chunking only works in the browser. Please use a supported browser.");
        setLoading(false);
        return;
      }
      setStatus("Chunking audio...");
      setError("");
      try {
        const { chunkAudioWithOverlap, transcribeChunks } = await import("@/lib/chunkAndTranscribe");
        const chunks = await chunkAudioWithOverlap(files[0], 240, 5, setProgress, setStatus); // 4min, 5s overlap
        setStatus("Uploading and transcribing...");
        const transcripts = await transcribeChunks(chunks, lang, setProgress, setStatus);
        setTranscript(transcripts.join(" ") + "\n\n(Transcribed by Whisper)");
        setStatus("Done!");
      } catch (err) {
        setError(err.message || "Audio chunking or transcription failed.");
        setTranscript("");
        setStatus("");
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9edfa] py-10">
      <h1 className="text-4xl font-bold mb-8">Quam Youtube Transcript</h1>
      <Card className="w-full max-w-lg bg-white shadow-lg border-none">
        <CardContent className="pt-10 pb-8 px-8">
          <form onSubmit={handleTranscribe} className="space-y-8">
            {/* Step 1: Input Audio */}
            <div>
              <div className="mb-2 font-semibold text-lg mt-0">Step 1: Input Audio</div>
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value="url"
                    checked={inputType === "url"}
                    onChange={() => setInputType("url")}
                  />
                  YouTube URL
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value="file"
                    checked={inputType === "file"}
                    onChange={() => setInputType("file")}
                  />
                  Upload Audio File
                  <a
                    href="https://en.y2mate.is/wXuA/youtube-to-mp3.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium border border-blue-200 transition"
                  >
                    Download MP3
                  </a>
                </label>
              </div>
              {inputType === "url" ? (
                <Input
                  type="text"
                  ref={youtubeUrlRef}
                  placeholder="Input the YouTube URL"
                  disabled={loading}
                  className="mb-2"
                />
              ) : (
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  disabled={loading}
                  className="mb-2"
                />
              )}
            </div>
            {/* Step 2: Language */}
            <div>
              <div className="mb-2 font-semibold text-lg">Step 2: Transcript Language</div>
              <Select value={lang} onValueChange={setLang} disabled={loading}>
                <SelectTrigger id="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-Hant">Cantonese</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Step 3: Transcribe Button */}
            <div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                {loading ? "Transcribing..." : "Transcribe"}
              </Button>
            </div>
            {loading && (
              <div>
                <div>Progress: {progress}%</div>
                <div>Status: {status}</div>
              </div>
            )}
            {error && (
              <div className="text-red-600 font-semibold mt-2">{error}</div>
            )}
            {/* Transcript Output (inside card) */}
            {transcript && (
              <div className="mt-8">
                <div className="font-semibold mb-2 text-lg">Transcript</div>
                <div className="whitespace-pre-wrap text-base text-gray-800 bg-gray-50 rounded p-4 border border-gray-200">
                  {transcript}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl border border-red-300 bg-white text-red-700 text-base font-semibold animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toast}
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease;
        }
      `}</style>
      <footer className="text-center mt-12 text-muted-foreground text-base">
        2025 @ Made with <span className="text-red-500">❤️</span> from iDDY
      </footer>
    </div>
  );
} 