import { Page } from '../App';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
  ollamaStatus: 'online' | 'offline' | 'checking';
  model: string;
}

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle, ollamaStatus, model }: SidebarProps) {
  const navItems = [
    {
      section: 'GENERAL',
      items: [
        { id: 'general' as Page, label: 'General AI', icon: '💬' },
      ],
    },
    {
      section: 'MINECRAFT',
      items: [
        { id: 'minecraft' as Page, label: 'Dashboard', icon: '🏠' },
        { id: 'minecraft-mod' as Page, label: 'Mod Builder', icon: '🔧' },
        { id: 'minecraft-plugin' as Page, label: 'Plugin Builder', icon: '🔌' },
        { id: 'minecraft-code' as Page, label: 'Code Assistant', icon: '💻' },
        { id: 'minecraft-errors' as Page, label: 'Error Fixer', icon: '🐛' },
      ],
    },
    {
      section: 'CODING',
      items: [
        { id: 'coding' as Page, label: 'Dashboard', icon: '🏠' },
        { id: 'coding-generator' as Page, label: 'Code Generator', icon: '⚡' },
        { id: 'coding-debugger' as Page, label: 'Debugger', icon: '🔍' },
        { id: 'coding-explainer' as Page, label: 'Code Explainer', icon: '📖' },
        { id: 'coding-optimizer' as Page, label: 'Optimizer', icon: '🚀' },
        { id: 'coding-linux' as Page, label: 'Linux Assistant', icon: '🐧' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}
      <aside
        className={`fixed md:relative z-50 h-full w-64 bg-[#111113] border-r border-[#27272a] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#27272a]">
          <div className="flex items-center gap-2">
            <span className="text-xl">✦</span>
            <h1 className="text-lg font-bold text-white">AI Hub</h1>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => onNavigate('general')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((section) => (
            <div key={section.section} className="mb-4">
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                {section.section}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === item.id
                      ? 'bg-[#7c3aed]/15 text-purple-300 border border-purple-500/20'
                      : 'text-zinc-400 hover:bg-[#222225] hover:text-zinc-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          {/* Settings */}
          <div className="mb-4">
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              SETTINGS
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentPage === 'settings'
                  ? 'bg-[#7c3aed]/15 text-purple-300 border border-purple-500/20'
                  : 'text-zinc-400 hover:bg-[#222225] hover:text-zinc-200'
              }`}
            >
              <span className="text-base">⚙️</span>
              Settings
            </button>
          </div>
        </nav>

        {/* Status */}
        <div className="p-3 border-t border-[#27272a]">
          <div className="flex items-center gap-2 px-2">
            <div className={`w-2 h-2 rounded-full ${
              ollamaStatus === 'online' ? 'bg-green-500' :
              ollamaStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-zinc-400">
              {ollamaStatus === 'online' ? 'Ollama Online' :
               ollamaStatus === 'checking' ? 'Checking...' :
               'Ollama Offline'}
            </span>
          </div>
          <div className="px-2 mt-1">
            <span className="text-xs text-zinc-500 font-mono">{model}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
