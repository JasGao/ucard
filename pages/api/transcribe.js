import formidable from "formidable";
import fs from "fs";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload error" });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.filepath),
        model: "whisper-1",
        language: fields.lang || "en"
      });
      res.status(200).json({ transcript: response.text });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
} 