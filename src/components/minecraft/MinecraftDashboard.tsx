import { Page } from '../../App';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function MinecraftDashboard({ onNavigate }: Props) {
  const tools = [
    {
      id: 'minecraft-mod' as Page,
      title: 'Mod Builder',
      description: 'Generate complete Minecraft mod projects for Fabric, Forge, and NeoForge',
      icon: '🔧',
      color: 'from-orange-500/20 to-red-500/20',
      border: 'border-orange-500/20',
    },
    {
      id: 'minecraft-plugin' as Page,
      title: 'Plugin Builder',
      description: 'Create Paper, Spigot, and Bukkit plugins with full project structure',
      icon: '🔌',
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/20',
    },
    {
      id: 'minecraft-code' as Page,
      title: 'Code Assistant',
      description: 'Get help with Minecraft Java development, APIs, and best practices',
      icon: '💻',
      color: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/20',
    },
    {
      id: 'minecraft-errors' as Page,
      title: 'Error Fixer',
      description: 'Debug Java errors, crash logs, and stack traces with precise fixes',
      icon: '🐛',
      color: 'from-red-500/20 to-pink-500/20',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">⛏️</span>
            Minecraft AI
          </h1>
          <p className="text-zinc-400 mt-2">
            Your expert assistant for Minecraft mod and plugin development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className={`p-5 rounded-xl bg-gradient-to-br ${tool.color} border ${tool.border} text-left hover:scale-[1.02] transition-all duration-200 group`}
            >
              <span className="text-2xl mb-3 block">{tool.icon}</span>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-zinc-400 mt-1">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-[#1a1a1d] border border-[#27272a]">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Supported Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {['Paper', 'Spigot', 'Bukkit', 'Fabric', 'Forge', 'NeoForge'].map(platform => (
              <span key={platform} className="px-2.5 py-1 rounded-md bg-[#222225] text-xs text-zinc-400 border border-[#333]">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
