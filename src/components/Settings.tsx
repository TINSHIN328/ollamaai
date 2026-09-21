import { useState } from 'react';
import { AppSettings, saveSettings } from '../utils/storage';

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export default function Settings({ settings, onSettingsChange }: Props) {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(localSettings);
    onSettingsChange(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults: AppSettings = {
      ollamaUrl: 'http://127.0.0.1:11434',
      model: 'qwen3:8b',
      temperature: 0.7,
      contextSize: 4096,
      darkMode: true,
      autoScroll: true,
      enterToSend: true,
    };
    setLocalSettings(defaults);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            Settings
          </h1>
          <p className="text-zinc-400 mt-2">Configure AI Hub preferences</p>
        </div>

        <div className="space-y-6">
          {/* Ollama Configuration */}
          <div className="p-5 rounded-xl bg-[#1a1a1d] border border-[#27272a]">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Ollama Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Ollama URL</label>
                <input
                  value={localSettings.ollamaUrl}
                  onChange={e => setLocalSettings({ ...localSettings, ollamaUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111113] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none"
                />
                <p className="text-xs text-zinc-600 mt-1">Default: http://127.0.0.1:11434</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Model</label>
                <input
                  value={localSettings.model}
                  onChange={e => setLocalSettings({ ...localSettings, model: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111113] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none"
                />
                <p className="text-xs text-zinc-600 mt-1">Default: qwen3:8b</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Temperature: {localSettings.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={e => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Precise (0)</span>
                  <span>Creative (2)</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Context Size</label>
                <input
                  type="number"
                  value={localSettings.contextSize}
                  onChange={e => setLocalSettings({ ...localSettings, contextSize: parseInt(e.target.value) || 4096 })}
                  className="w-full px-3 py-2 bg-[#111113] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none"
                />
                <p className="text-xs text-zinc-600 mt-1">Number of tokens for context window</p>
              </div>
            </div>
          </div>

          {/* Interface Settings */}
          <div className="p-5 rounded-xl bg-[#1a1a1d] border border-[#27272a]">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Interface</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Dark Mode</span>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, darkMode: !localSettings.darkMode })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${localSettings.darkMode ? 'bg-purple-600' : 'bg-[#333]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.darkMode ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Auto-scroll to bottom</span>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, autoScroll: !localSettings.autoScroll })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${localSettings.autoScroll ? 'bg-purple-600' : 'bg-[#333]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.autoScroll ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Enter to send message</span>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, enterToSend: !localSettings.enterToSend })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${localSettings.enterToSend ? 'bg-purple-600' : 'bg-[#333]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${localSettings.enterToSend ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              {saved ? '✓ Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-300 text-sm font-medium transition-colors border border-[#333]"
            >
              Reset to Defaults
            </button>
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-[#111113] border border-[#27272a]">
            <h4 className="text-xs font-medium text-zinc-400 mb-2">About</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              AI Hub connects to a local Ollama server for AI inference. All processing happens locally on your machine.
              Settings are stored in your browser's local storage. The Ollama server must be running for chat features to work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
