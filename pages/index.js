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
    <div className="container min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-6 mt-8">Quam Youtube Transcript</h1>
      <Card className="w-full max-w-xl shadow-lg">
        <CardContent className="p-8">
          <div className="mb-6 text-base text-muted-foreground">
            Enter a YouTube URL <b>or</b> upload an audio file below. Pick one method to get your transcript.
          </div>
          <form onSubmit={handleYoutubeSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                ref={youtubeUrlRef}
                placeholder="Input the YouTube URL"
                disabled={loading}
                className=""
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="language-select">Transcript Language:</Label>
              <Select value={lang} onValueChange={setLang} disabled={loading}>
                <SelectTrigger id="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh-Hant">Cantonese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              Get Transcript from YouTube
            </Button>
          </form>
          <div id="manual-upload-section" className="mt-8">
            <form onSubmit={handleAudioUpload} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="audio-file">
                  Or upload audio file (mp3, wav, m4a):
                </Label>
                <Input
                  type="file"
                  id="audio-file"
                  accept="audio/*"
                  ref={fileInputRef}
                  disabled={loading}
                  className=""
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                Transcribe Uploaded Audio
              </Button>
            </form>
          </div>
          <div className="transcript-label font-semibold mt-8 mb-2 text-lg">
            Transcript
            {loading && (
              <span id="whisper-loading" className="ml-2 align-middle">
                <span
                  className="spinner inline-block w-5 h-5 border-2 border-primary border-t-white rounded-full animate-spin align-middle"
                  style={{ verticalAlign: "middle" }}
                ></span>
              </span>
            )}
          </div>
          <div id="transcript-box" className="transcript-box min-h-[120px] bg-muted rounded p-4 text-base text-foreground whitespace-pre-wrap border border-border mb-2">
            {transcript}
          </div>
        </CardContent>
      </Card>
      {toast && <div className="toast show fixed top-8 left-1/2 -translate-x-1/2 bg-destructive text-white px-8 py-4 rounded shadow-lg z-50 text-lg font-medium">{toast}</div>}
      <footer className="text-center mt-12 text-muted-foreground text-base">
        2025 @ Made with <span className="text-red-500">❤️</span> from iDDY
      </footer>
    </div>
  );
} 