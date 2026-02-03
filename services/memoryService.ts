import { UserPreferences, DEFAULT_PREFERENCES, Message } from '../types';

const PREFS_KEY = 'shohayok_prefs';
const HISTORY_KEY = 'shohayok_history';

export const savePreferences = (prefs: UserPreferences): void => {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
};

export const getPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
};

export const saveHistory = (messages: Message[]): void => {
  try {
    // Keep only last 50 messages to prevent storage overflow
    const trimmed = messages.slice(-50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const getHistory = (): Message[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const clearMemory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};
