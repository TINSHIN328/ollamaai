import { useState } from 'react';
import { marked } from 'marked';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { sendChat, ChatMessage } from '../../utils/api';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

interface GeneratedFile {
  path: string;
  content: string;
}

export default function ModBuilder({ settings }: Props) {
  const [mcVersion, setMcVersion] = useState('1.20.4');
  const [loader, setLoader] = useState('Fabric');
  const [modName, setModName] = useState('');
  const [modId, setModId] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [javaVersion, setJavaVersion] = useState('17');
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateMod = async () => {
    if (!modName || !modId) {
      setError('Please fill in Mod Name and Mod ID');
      return;
    }
    setError('');
    setIsGenerating(true);
    setFiles([]);

    const prompt = `Generate a complete Minecraft ${loader} mod project with the following specifications:

- Minecraft Version: ${mcVersion}
- Mod Loader: ${loader}
- Mod Name: ${modName}
- Mod ID: ${modId}
- Description: ${description}
- Features: ${features}
- Java Version: ${javaVersion}

Generate ALL project files. For each file, use this exact format:
---FILE: path/to/file---
file content here
---END FILE---

Include at minimum:
- build.gradle (with correct dependencies for ${loader})
- settings.gradle
- gradle.properties
- src/main/java/ (main mod class and any feature classes)
- src/main/resources/ (mod metadata files)
- README.md

Make sure all code is complete, compiles, and follows ${loader} conventions for Minecraft ${mcVersion}.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: `You are an expert Minecraft mod developer. Generate complete, production-ready mod project files for ${loader}. Always use the exact file format specified. Provide ALL file contents completely - do not abbreviate or skip any code.` },
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
      setError(err.message || 'Failed to generate mod');
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
    files.forEach(file => {
      zip.file(file.path, file.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${modId || 'mod'}-project.zip`);
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyFile = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const selectedContent = files.find(f => f.path === selectedFile)?.content || '';

  const buildFileTree = (files: GeneratedFile[]) => {
    const tree: Record<string, string[]> = {};
    files.forEach(f => {
      const parts = f.path.split('/');
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
      if (!tree[dir]) tree[dir] = [];
      tree[dir].push(f.path);
    });
    return tree;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔧</span>
          <h2 className="text-sm font-medium text-zinc-200">Minecraft Mod Builder</h2>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Form Panel */}
        <div className="w-80 border-r border-[#27272a] overflow-y-auto p-4 bg-[#0d0d0f]">
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Mod Configuration</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Minecraft Version</label>
              <input
                value={mcVersion}
                onChange={e => setMcVersion(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Mod Loader</label>
              <select
                value={loader}
                onChange={e => setLoader(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none"
              >
                <option value="Fabric">Fabric</option>
                <option value="Forge">Forge</option>
                <option value="NeoForge">NeoForge</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Mod Name *</label>
              <input
                value={modName}
                onChange={e => setModName(e.target.value)}
                placeholder="My Awesome Mod"
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Mod ID *</label>
              <input
                value={modId}
                onChange={e => setModId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="my_awesome_mod"
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Java Version</label>
              <select
                value={javaVersion}
                onChange={e => setJavaVersion(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 focus:border-purple-500/40 outline-none"
              >
                <option value="17">Java 17</option>
                <option value="21">Java 21</option>
                <option value="16">Java 16</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What does your mod do?"
                rows={3}
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Features</label>
              <textarea
                value={features}
                onChange={e => setFeatures(e.target.value)}
                placeholder="List features, one per line..."
                rows={4}
                className="w-full px-3 py-2 bg-[#1a1a1d] border border-[#27272a] rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/40 outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={generateMod}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : 'Generate Mod Project'}
            </button>

            {files.length > 0 && (
              <button
                onClick={downloadZip}
                className="w-full py-2.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-300 text-sm font-medium transition-colors border border-[#333]"
              >
                📦 Download as ZIP
              </button>
            )}
          </div>
        </div>

        {/* File Explorer & Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {files.length > 0 ? (
            <>
              {/* File tree */}
              <div className="border-b border-[#27272a] bg-[#0d0d0f] p-2 overflow-x-auto">
                <div className="flex items-center gap-1 text-xs">
                  {Object.entries(buildFileTree(files)).map(([dir, dirFiles]) =>
                    dirFiles.map(filePath => (
                      <button
                        key={filePath}
                        onClick={() => setSelectedFile(filePath)}
                        className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                          selectedFile === filePath
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'text-zinc-400 hover:bg-[#222225] hover:text-zinc-200'
                        }`}
                      >
                        {filePath.split('/').pop()}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* File content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedFile && (
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111113] border-b border-[#27272a]">
                    <span className="text-xs text-zinc-400 font-mono">{selectedFile}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyFile(selectedContent)}
                        className="px-2 py-1 text-xs rounded bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400 transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => downloadFile(files.find(f => f.path === selectedFile)!)}
                        className="px-2 py-1 text-xs rounded bg-[#222225] hover:bg-[#2a2a2d] text-zinc-400 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-auto p-4">
                  {selectedFile?.endsWith('.md') ? (
                    <div
                      className="markdown-content text-sm text-zinc-200"
                      dangerouslySetInnerHTML={{ __html: marked(selectedContent) }}
                    />
                  ) : (
                    <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedContent}
                    </pre>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <span className="text-4xl mb-4 block">🔧</span>
                <p className="text-zinc-500 text-sm">Configure your mod and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
