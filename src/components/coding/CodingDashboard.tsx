import { Page } from '../../App';

interface Props { onNavigate: (page: Page) => void; }

export default function CodingDashboard({ onNavigate }: Props) {
  const tools = [
    { id: 'coding-generator' as Page, title: 'Code Generator', description: 'Generate production-quality code in any language', icon: '⚡', color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/20' },
    { id: 'coding-debugger' as Page, title: 'Debugger', description: 'Find and fix bugs in your code', icon: '🔍', color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/20' },
    { id: 'coding-explainer' as Page, title: 'Code Explainer', description: 'Understand any code with line-by-line explanations', icon: '📖', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/20' },
    { id: 'coding-optimizer' as Page, title: 'Optimizer', description: 'Optimize code for speed, memory, and security', icon: '🚀', color: 'from-green-500/20 to-teal-500/20', border: 'border-green-500/20' },
    { id: 'coding-linux' as Page, title: 'Linux Assistant', description: 'Linux commands, Docker, systemd, networking help', icon: '🐧', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">⌨️</span>
            Coding AI
          </h1>
          <p className="text-zinc-400 mt-2">Expert coding tools for developers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <button key={tool.id} onClick={() => onNavigate(tool.id)} className={`p-5 rounded-xl bg-gradient-to-br ${tool.color} border ${tool.border} text-left hover:scale-[1.02] transition-all duration-200 group`}>
              <span className="text-2xl mb-3 block">{tool.icon}</span>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{tool.title}</h3>
              <p className="text-sm text-zinc-400 mt-1">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-[#1a1a1d] border border-[#27272a]">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Supported Languages</h3>
          <div className="flex flex-wrap gap-2">
            {['Java', 'Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'PHP', 'Go', 'Rust', 'Bash', 'HTML', 'CSS', 'SQL'].map(lang => (
              <span key={lang} className="px-2.5 py-1 rounded-md bg-[#222225] text-xs text-zinc-400 border border-[#333]">{lang}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
