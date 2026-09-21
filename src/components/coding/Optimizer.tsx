import { useState } from 'react';
import { marked } from 'marked';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

export default function Optimizer({ settings }: Props) {
  const [code, setCode] = useState('');
  const [focus, setFocus] = useState('all');
  const [result, setResult] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState('');

  const optimize = async () => {
    if (!code.trim()) { setError('Please paste your code'); return; }
    setError('');
    setIsOptimizing(true);
    setResult('');

    const focusMap: Record<string, string> = {
      all: 'speed, memory usage, readability, and security',
      speed: 'execution speed and performance',
      memory: 'memory usage and efficiency',
      readability: 'code readability and maintainability',
      security: 'security vulnerabilities and best practices',
    };

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert performance engineer. Analyze code and provide optimizations. Explain each optimization and why it improves the code. Provide the complete optimized code.' },
      { role: 'user', content: `Optimize this code for ${focusMap[focus]}:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide:\n1. Analysis of current issues\n2. Optimized code\n3. Explanation of each change` },
    ];

    try {
      const response = await sendChat(messages, { model: settings.model, temperature: 0.3 });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to optimize code');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <h2 className="text-sm font-medium text-zinc-200">Code Optimizer</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-[#27272a] flex flex-col">
          <div className="p-3 border-b border-[#27272a] flex items-center gap-3">
            <select value={focus} onChange={e => setFocus(e.target.value)} className="px-2 py-1 bg-[#1a1a1d] border border-[#27272a] rounded text-xs text-zinc-300 outline-none">
              <option value="all">All (Speed, Memory, Readability, Security)</option>
              <option value="speed">Speed</option>
              <option value="memory">Memory</option>
              <option value="readability">Readability</option>
              <option value="security">Security</option>
            </select>
          </div>
          <div className="flex-1 p-4">
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste code to optimize..." className="w-full h-full px-4 py-3 bg-[#1a1a1d] border border-[#27272a] rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none font-mono leading-relaxed" />
          </div>
          <div className="p-4 border-t border-[#27272a]">
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <button onClick={optimize} disabled={isOptimizing} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {isOptimizing ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Optimizing...</span> : '🚀 Optimize Code'}
            </button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-zinc-300">Optimized Result</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-4">
                <div className="markdown-content text-sm text-zinc-200" dangerouslySetInnerHTML={{ __html: marked(result) }} />
                <button onClick={() => navigator.clipboard.writeText(result)} className="px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400 text-xs">📋 Copy</button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <span className="text-4xl mb-4 block">🚀</span>
                  <p className="text-zinc-500 text-sm">Paste code and click Optimize</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
