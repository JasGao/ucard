import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [lang, setLang] = useState("zh-Hant"); // Default to Cantonese
  const [inputType, setInputType] = useState("url");
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

  async function handleTranscribe(e) {
    e.preventDefault();
    setTranscript("");
    setLoading(true);
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
        showToast("Automatic audio download failed: " + (err.message || err));
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
      await transcribeAudioBlob(files[0], lang);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9edfa] py-10">
      <h1 className="text-4xl font-bold mb-8">Quam Youtube Transcript</h1>
      <Card className="w-full max-w-lg bg-white shadow-lg border-none">
        <CardContent className="p-8">
          <form onSubmit={handleTranscribe} className="space-y-8">
            {/* Step 1: Input Audio */}
            <div>
              <div className="mb-2 font-semibold text-lg">Step 1: Input Audio</div>
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
          </form>
        </CardContent>
      </Card>
      {/* Transcript Output */}
      <div className="w-full max-w-lg mt-8">
        {transcript && (
          <Card className="bg-white shadow border-none">
            <CardContent className="p-6">
              <div className="font-semibold mb-2 text-lg">Transcript</div>
              <div className="whitespace-pre-wrap text-base text-gray-800">
                {transcript}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {toast && <div className="toast show fixed top-8 left-1/2 -translate-x-1/2 bg-destructive text-white px-8 py-4 rounded shadow-lg z-50 text-lg font-medium">{toast}</div>}
      <footer className="text-center mt-12 text-muted-foreground text-base">
        2025 @ Made with <span className="text-red-500">❤️</span> from iDDY
      </footer>
    </div>
  );
} 