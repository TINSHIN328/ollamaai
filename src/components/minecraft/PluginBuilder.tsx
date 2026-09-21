import { useState } from 'react';
import { marked } from 'marked';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }
interface GeneratedFile { path: string; content: string; }

export default function PluginBuilder({ settings }: Props) {
  const [mcVersion, setMcVersion] = useState('1.20.4');
  const [platform, setPlatform] = useState('Paper');
  const [pluginName, setPluginName] = useState('');
  const [pluginId, setPluginId] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [commands, setCommands] = useState('');
  const [permissions, setPermissions] = useState('');
  const [features, setFeatures] = useState('');
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generatePlugin = async () => {
    if (!pluginName || !pluginId) { setError('Please fill in Plugin Name and Plugin ID'); return; }
    setError('');
    setIsGenerating(true);
    setFiles([]);

    const prompt = `Generate a complete Minecraft ${platform} plugin project:

- Minecraft Version: ${mcVersion}
- Platform: ${platform}
- Plugin Name: ${pluginName}
- Plugin ID: ${pluginId}
- Author: ${author}
- Description: ${description}
- Commands: ${commands || 'None specified'}
- Permissions: ${permissions || 'None specified'}
- Features: ${features}

Generate ALL project files using this exact format:
---FILE: path/to/file---
file content here
---END FILE---

Include at minimum:
- build.gradle (with ${platform} API dependency)
- settings.gradle
- src/main/java/ (main plugin class, command classes, listener classes)
- src/main/resources/plugin.yml
- README.md

All code must be complete, compile, and follow ${platform} conventions for Minecraft ${mcVersion}.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: `You are an expert Minecraft plugin developer specializing in ${platform}. Generate complete, production-ready plugin project files. Always use the exact file format specified. Provide ALL file contents completely.` },
      { role: 'user', content: prompt },
    ];

    try {
      const response = await sendChat(messages, { model: settings.model, temperature: 0.3 });
      const parsedFiles = parseFiles(response);
      if (parsedFiles.length === 0) {
        setFiles([{ path: 'response.md', content: response }]);
      } else {
        setFiles(parsedFiles);
        setSelectedFile(parsedFiles[0].path);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate plugin');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseFiles = (text: string): GeneratedFile[] => {
    const files: GeneratedFile[] = [];
    const regex = /---FILE:\s*(.+?)---\n([\s\S]*?)---END FILE---/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      files.push({ path: match[1].trim(), content: match[2].trim() });
    }
    return files;
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    files.forEach(file => zip.file(file.path, file.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${pluginId || 'plugin'}-project.zip`);
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.path.split('/').pop() || 'file'; a.click();
    URL.revokeObjectURL(url);
  };

  const selectedContent = files.find(f => f.path === selectedFile)?.content || '';

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔌</span>
          <h2 className="text-sm font-medium text-zinc-200">Minecraft Plugin Builder</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-[#27272a] overflow-y-auto p-4 bg-[#0d0d0f]">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Plugin Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Minecraft Version</label>
              <input value={mcVersion} onChange={e => setMcVersion(e.target.value)} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none">
                <option value="Paper">Paper</option>
                <option value="Spigot">Spigot</option>
                <option value="Bukkit">Bukkit</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Plugin Name *</label>
              <input value={pluginName} onChange={e => setPluginName(e.target.value)} placeholder="MyPlugin" className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Plugin ID *</label>
              <input value={pluginId} onChange={e => setPluginId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="myplugin" className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does your plugin do?" rows={2} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Commands</label>
              <textarea value={commands} onChange={e => setCommands(e.target.value)} placeholder="heal - Heal yourself&#10;fly - Toggle flight" rows={3} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Permissions</label>
              <textarea value={permissions} onChange={e => setPermissions(e.target.value)} placeholder="myplugin.heal&#10;myplugin.fly" rows={2} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Features</label>
              <textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="List features..." rows={3} className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none" />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
            <button onClick={generatePlugin} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {isGenerating ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</span> : 'Generate Plugin Project'}
            </button>
            {files.length > 0 && (
              <button onClick={downloadZip} className="w-full py-2.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-300 text-sm font-medium transition-colors border border-[#333]">
                📦 Download as ZIP
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {files.length > 0 ? (
            <>
              <div className="border-b border-[#27272a] bg-[#0d0d0f] p-2 overflow-x-auto">
                <div className="flex items-center gap-1 text-xs">
                  {files.map(f => (
                    <button key={f.path} onClick={() => setSelectedFile(f.path)} className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${selectedFile === f.path ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:bg-[#222225]'}`}>
                      {f.path.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedFile && (
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111113] border-b border-[#27272a]">
                    <span className="text-xs text-zinc-400 font-mono">{selectedFile}</span>
                    <div className="flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(selectedContent)} className="px-2 py-1 text-xs rounded bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400">Copy</button>
                      <button onClick={() => downloadFile(files.find(f => f.path === selectedFile)!)} className="px-2 py-1 text-xs rounded bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400">Download</button>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-auto p-4">
                  {selectedFile?.endsWith('.md') ? (
                    <div className="markdown-content text-sm text-zinc-200" dangerouslySetInnerHTML={{ __html: marked(selectedContent) }} />
                  ) : (
                    <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">{selectedContent}</pre>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <span className="text-4xl mb-4 block">🔌</span>
                <p className="text-zinc-500 text-sm">Configure your plugin and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
