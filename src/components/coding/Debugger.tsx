import { useState } from 'react';
import { marked } from 'marked';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

export default function Debugger({ settings }: Props) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [result, setResult] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [error, setError] = useState('');

  const debug = async () => {
    if (!code.trim()) { setError('Please paste your code'); return; }
    setError('');
    setIsDebugging(true);
    setResult('');

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an expert debugging assistant. Analyze the provided code carefully. Identify the exact problem, explain the cause, and provide corrected code with a clear explanation of what was wrong and how it was fixed. Format your response with: ## Problem, ## Cause, ## Fixed Code, ## Explanation.' },
      { role: 'user', content: `Debug this ${language !== 'auto' ? language : ''} code:\n\n\`\`\`${language !== 'auto' ? language : ''}\n${code}\n\`\`\`\n\nIf there's an error message, here it is:\n(Paste error message above if any)` },
    ];

    try {
      const response = await sendChat(messages, { model: settings.model, temperature: 0.2 });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to debug code');
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <h2 className="text-sm font-medium text-zinc-200">Code Debugger</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-[#27272a] flex flex-col">
          <div className="p-3 border-b border-[#27272a] flex items-center gap-3">
            <select value={language} onChange={e => setLanguage(e.target.value)} className="px-2 py-1 bg-[#1a1a1d] border border-[#27272a] rounded text-xs text-zinc-300 outline-none">
              <option value="auto">Auto-detect</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
          <div className="flex-1 p-4">
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your code here..." className="w-full h-full px-4 py-3 bg-[#1a1a1d] border border-[#27272a] rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none font-mono leading-relaxed" />
          </div>
          <div className="p-4 border-t border-[#27272a]">
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <button onClick={debug} disabled={isDebugging} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {isDebugging ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Debugging...</span> : '🔍 Debug Code'}
            </button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-zinc-300">Debug Result</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-4">
                <div className="markdown-content text-sm text-zinc-200" dangerouslySetInnerHTML={{ __html: marked(result) }} />
                <button onClick={() => navigator.clipboard.writeText(result)} className="px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400 text-xs">📋 Copy Result</button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <span className="text-4xl mb-4 block">🔍</span>
                  <p className="text-zinc-500 text-sm">Paste code and click Debug</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
