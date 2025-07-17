export async function chunkAudioWithOverlap(file, chunkDurationSec = 240, overlapSec = 5, setProgress, setStatus) {
  const ffmpegModule = await import("@ffmpeg/ffmpeg");
  const createFFmpeg = ffmpegModule.createFFmpeg || (ffmpegModule.default && ffmpegModule.default.createFFmpeg);
  const fetchFile = ffmpegModule.fetchFile || (ffmpegModule.default && ffmpegModule.default.fetchFile);
  const ffmpeg = createFFmpeg({ log: true });

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
}

export async function transcribeChunks(chunks, lang, setProgress, setStatus) {
  setStatus?.("Transcribing...");
  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    setProgress?.(Math.round((i / chunks.length) * 100));
    const formData = new FormData();
    formData.append("file", chunks[i]);
    formData.append("lang", lang);

    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    results.push(data.transcript);
  }
  setProgress?.(100);
  setStatus?.("Transcription complete.");
  return results;
} 