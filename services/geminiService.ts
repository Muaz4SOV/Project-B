
import { GoogleGenAI } from "@google/genai";

export const getGeminiGreeting = async (userName: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Welcome to your secure dashboard!";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a very short, professional, and welcoming greeting for a user named ${userName} who just logged into their secure SSO portal. Mention that their session is now globally active across the enterprise suite.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    return response.text || `Welcome back, ${userName}!`;
  } catch (error) {
    console.error("Gemini Greeting Error:", error);
    return `Welcome back, ${userName}! Your secure session is active.`;
  }
};
