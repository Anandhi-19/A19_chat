
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = "AIzaSyBpypGwmpsAx3VwyPwuGrtuQiZIv716lnk";

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export function getChatResponse(systemInstruction: string): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return chat;
}
