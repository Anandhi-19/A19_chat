
import { GoogleGenAI, Chat, Content, FunctionDeclaration, Type } from "@google/genai";

const API_KEY = "AIzaSyBpypGwmpsAx3VwyPwuGrtuQiZIv716lnk";

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getCurrentDateTimeDeclaration: FunctionDeclaration = {
    name: 'getCurrentDateTime',
    description: 'Gets the current date and time. Use this for any questions related to the current date or time.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
    }
};

export function getChatResponse(systemInstruction: string, history: Content[] = []): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [getCurrentDateTimeDeclaration] }],
    },
  });
  return chat;
}
