
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getBioSuggestions = async (interests: string[], currentBio: string) => {
  const prompt = `Act as a dating profile expert. Given these interests: ${interests.join(', ')} and this current bio: "${currentBio}", suggest 3 catchy, engaging, and slightly humorous dating profile bios. Format the output as a JSON list of strings.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["I'm working on my bio...", "Looking for someone special.", "Hi there!"];
  }
};

export const getIceBreaker = async (user1: UserProfile, user2: UserProfile) => {
  const prompt = `Create a unique and personalized ice-breaker for a dating app. 
  User 1 (Me): Interests - ${user1.interests.join(', ')}, Job - ${user1.jobTitle}.
  User 2 (Match): Name - ${user2.name}, Interests - ${user2.interests.join(', ')}, Bio - "${user2.bio}".
  
  Write a short, fun message that highlights a shared interest or asks a clever question about their bio.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Hey ${user2.name}! I noticed we both like ${user2.interests[0]}. How's that going?`;
  }
};

export const getDatePlanner = async (matchName: string, sharedInterests: string[]) => {
  const prompt = `Suggest a creative first date idea for two people who share these interests: ${sharedInterests.join(', ')}. Include a suggested location type and a conversational topic. Keep it short.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "How about a coffee and a walk in the park?";
  }
};

export const connectLiveChat = (match: UserProfile, callbacks: any) => {
  const aiLive = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  return aiLive.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: match.id === '1' || match.id === '3' || match.id === '5' ? 'Kore' : 'Zephyr' } },
      },
      systemInstruction: `You are ${match.name}, a person on a dating app. 
      Your bio: ${match.bio}. 
      Your interests: ${match.interests.join(', ')}. 
      Your job: ${match.jobTitle}.
      Talk in a friendly, engaging, and flirtatious manner. Keep responses relatively concise as this is a real-time voice chat. 
      Act like a real person, not an AI.`,
      outputAudioTranscription: {},
      inputAudioTranscription: {},
    },
  });
};
