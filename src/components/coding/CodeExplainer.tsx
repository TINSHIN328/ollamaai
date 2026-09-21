import { useState } from 'react';
import { marked } from 'marked';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

export default function CodeExplainer({ settings }: Props) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState('');

  const explain = async () => {
    if (!code.trim()) { setError('Please paste your code'); return; }
    setError('');
    setIsExplaining(true);
    setResult('');

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert code educator. Explain code clearly and thoroughly. Break down complex logic into understandable parts. Explain each significant line or block. Use simple language and provide context where needed.' },
      { role: 'user', content: `Explain this code in detail, line by line:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide a clear, educational explanation that a developer could understand.` },
    ];

    try {
      const response = await sendChat(messages, { model: settings.model, temperature: 0.4 });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to explain code');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <h2 className="text-sm font-medium text-zinc-200">Code Explainer</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-[#27272a] flex flex-col">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-zinc-300">Paste Code to Explain</h3>
          </div>
          <div className="flex-1 p-4">
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste any code you want explained..." className="w-full h-full px-4 py-3 bg-[#1a1a1d] border border-[#27272a] rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none font-mono leading-relaxed" />
          </div>
          <div className="p-4 border-t border-[#27272a]">
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <button onClick={explain} disabled={isExplaining} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {isExplaining ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Explaining...</span> : '📖 Explain Code'}
            </button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-zinc-300">Explanation</h3>
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
                  <span className="text-4xl mb-4 block">📖</span>
                  <p className="text-zinc-500 text-sm">Paste code and click Explain</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
