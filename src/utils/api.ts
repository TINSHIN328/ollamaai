const API_BASE = '/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export async function checkHealth(): Promise<{ status: string; model?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline' };
  }
}

export async function getModels(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();
    return data.models || [];
  } catch {
    return [];
  }
}

export async function sendChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, ...options }),
      signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Cannot connect to AI Hub server. Make sure the backend is running with `npm start`.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  if (options.stream && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.message?.content || '';
          full += content;
          onChunk?.(content);
        } catch {}
      }
    }
    return full;
  }

  const data = await res.json();
  return data.message?.content || data.response || '';
}

export async function generateCode(
  prompt: string,
  systemPrompt: string,
  options: ChatOptions = {}
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];
  return sendChat(messages, options);
}
