import { useState } from 'react';
import { marked } from 'marked';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

export default function ErrorFixer({ settings }: Props) {
  const [errorLog, setErrorLog] = useState('');
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyzeError = async () => {
    if (!errorLog.trim()) { setError('Please paste an error log or stack trace'); return; }
    setError('');
    setIsAnalyzing(true);
    setResult('');

    const messages: ChatMessage[] = [
      { role: 'system', content: `You are an expert Minecraft server and Java debugging assistant. Analyze logs and stack traces carefully. Identify the exact error, likely cause, and concrete fix. Provide commands or corrected code when possible. Format your response with these sections:

## Error
The exact error message

## Cause
What caused this error

## Fix
Step-by-step fix with exact commands or code

## Prevention
How to prevent this in the future` },
      { role: 'user', content: `Analyze this error/stack trace:\n\n\`\`\`\n${errorLog}\n\`\`\`` },
    ];

    try {
      const response = await sendChat(messages, { model: settings.model, temperature: 0.2 });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">🐛</span>
          <h2 className="text-sm font-medium text-zinc-200">Minecraft Error Fixer</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="w-1/2 border-r border-[#27272a] flex flex-col">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Paste Error / Stack Trace</h3>
            <p className="text-xs text-zinc-500">Java errors, Gradle errors, crash logs, Paper logs, stack traces</p>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={errorLog}
              onChange={e => setErrorLog(e.target.value)}
              placeholder="Paste your error log, stack trace, or crash report here..."
              className="w-full h-full px-4 py-3 bg-[#1a1a1d] border border-[#27272a] rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none font-mono leading-relaxed"
            />
          </div>
          <div className="p-4 border-t border-[#27272a]">
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <button
              onClick={analyzeError}
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : '🔍 Analyze Error'}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="text-sm font-medium text-zinc-300">Analysis Result</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-4">
                <div
                  className="markdown-content text-sm text-zinc-200"
                  dangerouslySetInnerHTML={{ __html: marked(result) }}
                />
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400 text-xs transition-colors"
                >
                  📋 Copy Result
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <span className="text-4xl mb-4 block">🐛</span>
                  <p className="text-zinc-500 text-sm">Paste an error and click Analyze</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
