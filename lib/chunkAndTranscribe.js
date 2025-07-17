export function isBrowser() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

export async function chunkAudioWithOverlap(file, chunkDurationSec = 240, overlapSec = 5, setProgress, setStatus) {
  if (!isBrowser()) throw new Error('Audio chunking only works in the browser.');
  let ffmpegModule, createFFmpeg, fetchFile, ffmpeg;
  try {
    ffmpegModule = await import("@ffmpeg/ffmpeg");
    console.log("[DEBUG] ffmpegModule:", ffmpegModule);
    createFFmpeg = ffmpegModule.createFFmpeg
      || (ffmpegModule.default && ffmpegModule.default.createFFmpeg)
      || ffmpegModule.default;
    fetchFile = ffmpegModule.fetchFile
      || (ffmpegModule.default && ffmpegModule.default.fetchFile)
      || (ffmpegModule.default && ffmpegModule.default.fetchFile);
    if (typeof createFFmpeg !== 'function') {
      throw new Error('[DEBUG] createFFmpeg is not a function. Module structure: ' + JSON.stringify(ffmpegModule));
    }
    if (typeof fetchFile !== 'function') {
      throw new Error('[DEBUG] fetchFile is not a function. Module structure: ' + JSON.stringify(ffmpegModule));
    }
    ffmpeg = createFFmpeg({ log: true });
  } catch (err) {
    console.error('Failed to load ffmpeg.wasm:', err);
    throw new Error('Failed to load ffmpeg.wasm. Please refresh or try a different browser. ' + (err.message || err));
  }
  try {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    setStatus?.("Analyzing audio...");
    ffmpeg.FS("writeFile", "input.mp3", await fetchFile(file));
    let duration = 0;
    ffmpeg.setLogger(({ message }) => {
      const match = message.match(/Duration: (\\d+):(\\d+):(\\d+\\.\\d+)/);
      if (match) {
        const [, h, m, s] = match;
        duration = +h * 3600 + +m * 60 + +s;
      }
    });
    await ffmpeg.run("-i", "input.mp3");
    const chunks = [];
    let start = 0;
    let idx = 0;
    setStatus?.("Chunking audio...");
    while (start < duration) {
      const outputName = `chunk_${idx}.mp3`;
      const actualDuration = Math.min(chunkDurationSec, duration - start);
      await ffmpeg.run(
        "-ss", `${start}`,
        "-t", `${actualDuration}`,
        "-i", "input.mp3",
        "-acodec", "copy",
        outputName
      );
      const data = ffmpeg.FS("readFile", outputName);
      chunks.push(new File([data.buffer], outputName, { type: file.type }));
      ffmpeg.FS("unlink", outputName);
      start += chunkDurationSec - overlapSec;
      idx++;
      setProgress?.(Math.min(100, Math.round((start / duration) * 100)));
    }
    ffmpeg.FS("unlink", "input.mp3");
    setStatus?.("Chunking complete.");
    return chunks;
  } catch (err) {
    console.error('Error during audio chunking:', err);
    setStatus?.("Chunking failed.");
    throw new Error('Audio chunking failed. Please try a different file or browser.');
  }
}

export async function transcribeChunks(chunks, lang, setProgress, setStatus) {
  setStatus?.("Transcribing...");
  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    setProgress?.(Math.round((i / chunks.length) * 100));
    const formData = new FormData();
    formData.append("file", chunks[i]);
    formData.append("lang", lang);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      results.push(data.transcript);
    } catch (err) {
      console.error(`Transcription failed for chunk ${i}:`, err);
      results.push(`[Error transcribing chunk ${i + 1}]`);
    }
  }
  setProgress?.(100);
  setStatus?.("Transcription complete.");
  return results;
} 