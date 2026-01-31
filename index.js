import dotenv, { config } from "dotenv"; dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { env } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); app.use(cors()); app.use(express.json()); 
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";
app.use(express.static(path.join(__dirname, 'public')));

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation)) {
      throw new Error("Invalid input: conversation must be an array.");
    }

    const contents = conversation.map(({ role, content, text }) => ({
      role,
      parts: [{ text: text ?? content }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstructions:
          "You are a helpful assistant, and you will only answer in English.",
      },
    });

    const result =
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      throw new Error("No text returned from Gemini.");
    }

    res.status(200).json({ result });
  } catch (e) {
    console.error("Chat error:", e);
    res.status(500).json({ error: e.message });
  }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
