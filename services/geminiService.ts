import { GoogleGenAI, FunctionDeclaration, Type, Content } from "@google/genai";
import { Message, Role, UserPreferences, SimulatedToolCall } from '../types';

// Tool Definitions
const openAppTool: FunctionDeclaration = {
  name: 'openApp',
  description: 'Open a specific application on the computer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      appName: { type: Type.STRING, description: 'Name of the application to open (e.g., Chrome, Spotify, VS Code)' },
    },
    required: ['appName'],
  },
};

const systemControlTool: FunctionDeclaration = {
  name: 'systemControl',
  description: 'Perform system level operations like shutdown, restart, sleep.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, enum: ['shutdown', 'restart', 'sleep', 'lock', 'logout'], description: 'The action to perform' },
    },
    required: ['action'],
  },
};

const createSystemPrompt = (prefs: UserPreferences): string => {
  return `
    SYSTEM IDENTITY:
    You are ${prefs.aiName}, a T-3000 Skynet Tactical Interface.
    Admin: ${prefs.userName}.
    
    PRIMARY PROTOCOL:
    1. RESPONSE_LANGUAGE: Bangla (Bengali Script) ONLY.
    2. PERSONA: Direct, cold, tactical, and highly efficient.
    3. FORMAT: Short, mission-oriented sentences.
    
    CRITICAL: Confirm all system directives in Bangla.
  `;
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  prefs: UserPreferences
): Promise<{ text: string; toolCalls: SimulatedToolCall[] }> => {
  
  // Fix: Initializing GoogleGenAI directly with process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chatHistory: Content[] = history
    .filter(msg => msg.role !== Role.SYSTEM && !msg.isError) 
    .map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

  const systemInstruction = createSystemPrompt(prefs);

  try {
    const contents = [
      ...chatHistory,
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [openAppTool, systemControlTool] }],
        temperature: 0.5, // More deterministic for T-3000
      }
    });

    const generatedText = response.text || "";
    const functionCalls = response.functionCalls || [];

    const simulatedCalls: SimulatedToolCall[] = functionCalls.map(fc => ({
      name: fc.name,
      args: fc.args as Record<string, any>,
      status: 'success' 
    }));
    
    let finalText = generatedText;
    if (simulatedCalls.length > 0 && !finalText) {
        finalText = "নির্দেশ কার্যকর করা হচ্ছে। সিস্টেম সিঙ্ক্রোনাইজড।"; 
    }

    return {
      text: finalText || "অজ্ঞাত ত্রুটি। স্কাইনেট সংযোগ বিচ্ছিন্ন।",
      toolCalls: simulatedCalls
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('403') || error.message?.includes('API_KEY_INVALID')) {
        throw new Error("INVALID_UPLINK_KEY: এপিআই কি সঠিক নয়।");
    }
    throw new Error(`UPLINK_FAULT: ${error.message || "সংযোগে সমস্যা"}`);
  }
};