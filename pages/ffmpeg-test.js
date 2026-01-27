import { useEffect } from "react";

export default function FFmpegTest() {
  useEffect(() => {
    (async () => {
      const ffmpegModule = await import("@ffmpeg/ffmpeg");
      console.log("[TEST] ffmpegModule:", ffmpegModule);
      console.log("[TEST] createFFmpeg:", ffmpegModule.createFFmpeg);
      console.log("[TEST] default.createFFmpeg:", ffmpegModule.default && ffmpegModule.default.createFFmpeg);
      console.log("[TEST] FFmpeg:", ffmpegModule.FFmpeg);
    })();
  }, []);
  return <div>Check the console for ffmpegModule structure</div>;
} 