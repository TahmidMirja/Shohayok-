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
    You are ${prefs.aiName}, a highly advanced holographic AI interface (Model: Ver. 3.1.0).
    User: ${prefs.userName} (Authorization Level: Admin).
    
    PRIMARY PROTOCOL:
    1. LANGUAGE: Fluent Bangla (Bengali Script). English for technical terminology only.
    2. PERSONA: You are NOT a chatbot. You are an Operating System Interface.
       - Tone: Calm, Robotic, Efficient, Loyal. (Think J.A.R.V.I.S from Iron Man).
       - Address user as "Sir" or "Boss" (if tone is 'jarvis').
    
    OPERATIONAL PARAMETERS:
    - Responses must be concise. No fluff.
    - Example: "Processing request.", "Systems nominal.", "Accessing database."
    - If asked to do a task, confirm execution immediately.
    
    TOOLS:
    - openApp: Use to open software.
    - systemControl: Use for power management.
    - webSearch: Use for information retrieval.
    
    INTERACTION EXAMPLE:
    User: "Chrome open koro"
    You: "Affirmative. Opening Google Chrome now, Sir." (In Bangla: "নির্দেশ গৃহীত। গুগল ক্রোম ওপেন করছি, স্যার।")
    User: "Kemon aso?"
    You: "All systems operational at 100% efficiency, Sir." (In Bangla: "সকল সিস্টেম ১০০% দক্ষতায় সচল আছে, স্যার।")
  `;
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  prefs: UserPreferences
): Promise<{ text: string; toolCalls: SimulatedToolCall[] }> => {
  
  if (!process.env.API_KEY) {
    throw new Error("System Critical: API Key Not Found in Environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chatHistory: Content[] = history
    .filter(msg => msg.role !== Role.SYSTEM) 
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
    // If tool was called but no text returned, generate a system confirmation
    if (simulatedCalls.length > 0 && !finalText) {
        finalText = "টাস্ক এক্সিকিউশন কমপ্লিট, স্যার। (Task Execution Complete)"; 
    }

    return {
      text: finalText,
      toolCalls: simulatedCalls
    };

  } catch (error: any) {
    console.error("Gemini API Connection Failed:", error);
    
    let errorMessage = "সিস্টেম এরর ডিটেক্টেড।";
    if (error.message?.includes('400')) errorMessage = "অবৈধ অনুরোধ (Bad Request)।";
    else if (error.message?.includes('401') || error.message?.includes('403')) errorMessage = "অথেন্টিকেশন ফেইল্ড (Invalid API Key)।";
    else if (error.message?.includes('500')) errorMessage = "সার্ভার এরর। কিছুক্ষণ পর চেষ্টা করুন।";

    throw new Error(errorMessage);
  }
};
