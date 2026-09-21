import { useState } from 'react';
import { marked } from 'marked';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

const LANGUAGES = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'PHP', 'Go', 'Rust', 'Bash', 'HTML', 'CSS', 'SQL'];

export default function CodeGenerator({ settings }: Props) {
  const [language, setLanguage] = useState('Python');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!description.trim()) { setError('Please describe what you want to generate'); return; }
    setError('');
    setIsGenerating(true);
    setResult('');

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert software engineer. Generate clean, well-documented, production-quality code. Include comments explaining key logic. Follow best practices and conventions for the language.' },
      { role: 'user', content: `Generate ${language} code for the following:\n\n${description}\n\nProvide complete, working code with comments.` },
    ];

    try {
      const response = await sendChat(messages, { model: settings.model, temperature: 0.3 });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <h2 className="text-sm font-medium text-zinc-200">Code Generator</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-[#27272a] flex flex-col p-4 bg-[#0d0d0f]">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Configuration</h3>
          <div className="space-y-3 flex-1">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-1 block">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you want to build..." rows={10} className="w-full h-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button onClick={generate} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {isGenerating ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</span> : '⚡ Generate Code'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#111113] border-b border-[#27272a]">
            <span className="text-xs text-zinc-400">Generated Code</span>
            {result && (
              <button onClick={() => navigator.clipboard.writeText(result)} className="px-2 py-1 text-xs rounded bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400">Copy</button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {result ? (
              <div className="markdown-content text-sm text-zinc-200" dangerouslySetInnerHTML={{ __html: marked(result) }} />
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <span className="text-4xl mb-4 block">⚡</span>
                  <p className="text-zinc-500 text-sm">Describe what you want and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
