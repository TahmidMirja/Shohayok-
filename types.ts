export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isError?: boolean;
  toolCalls?: SimulatedToolCall[];
}

export interface UserPreferences {
  userName: string;
  aiName: string;
  tone: 'formal' | 'casual' | 'witty' | 'jarvis';
  voiceEnabled: boolean;
  theme: 'dark' | 'midnight';
  animationLevel: 'low' | 'high';
}

export interface SimulatedToolCall {
  name: string;
  args: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  result?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'User',
  aiName: 'Shohayok',
  tone: 'jarvis',
  voiceEnabled: false,
  theme: 'midnight',
  animationLevel: 'high',
};
