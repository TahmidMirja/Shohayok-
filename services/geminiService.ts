import { GoogleGenAI, FunctionDeclaration, Type, Content } from "@google/genai";
import { Message, Role, UserPreferences, SimulatedToolCall } from '../types';

// Robust API Key Retrieval
const getApiKey = (): string => {
  // Check window.process first (the polyfill), then global process
  const key = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env?.API_KEY : '');
  return key || "AIzaSyDMosEPTs3tjlIRE0MWhho0TfgcBhDUzQU"; // Fallback to provided key
};

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

const webSearchTool: FunctionDeclaration = {
  name: 'webSearch',
  description: 'Search the internet for a query.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'The search query' },
    },
    required: ['query'],
  },
};

const createSystemPrompt = (prefs: UserPreferences): string => {
  return `
    SYSTEM IDENTITY:
    You are ${prefs.aiName}, a tactical holographic AI assistant.
    User: ${prefs.userName} (Admin).
    
    PRIMARY PROTOCOL:
    1. LANGUAGE: Fluent Bangla (Bengali Script).
    2. PERSONA: You are a tactical OS interface (Like JARVIS but in Orange).
    3. TONE: Calm, efficient, and direct.
    
    RULES:
    - Keep responses short.
    - Confirm tool actions immediately in Bangla.
  `;
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  prefs: UserPreferences
): Promise<{ text: string; toolCalls: SimulatedToolCall[] }> => {
  
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key configuration missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
        tools: [{ functionDeclarations: [openAppTool, systemControlTool, webSearchTool] }],
        temperature: 0.7,
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
        finalText = "নির্দেশ কার্যকর করা হচ্ছে, স্যার।"; 
    }

    return {
      text: finalText || "অজ্ঞাত সমস্যা, আবার চেষ্টা করুন।",
      toolCalls: simulatedCalls
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "সার্ভার সংযোগ বিচ্ছিন্ন।");
  }
};
