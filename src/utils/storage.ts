import { ChatMessage } from './api';

export interface ChatSession {
  id: string;
  title: string;
  section: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  ollamaUrl: string;
  model: string;
  temperature: number;
  contextSize: number;
  darkMode: boolean;
  autoScroll: boolean;
  enterToSend: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  ollamaUrl: 'http://127.0.0.1:11434',
  model: 'qwen3:8b',
  temperature: 0.7,
  contextSize: 4096,
  darkMode: true,
  autoScroll: true,
  enterToSend: true,
};

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem('ai-hub-settings');
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem('ai-hub-settings', JSON.stringify(settings));
}

export function getChats(section: string): ChatSession[] {
  try {
    const stored = localStorage.getItem(`ai-hub-chats-${section}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function saveChats(section: string, chats: ChatSession[]): void {
  localStorage.setItem(`ai-hub-chats-${section}`, JSON.stringify(chats));
}

export function createChatId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
