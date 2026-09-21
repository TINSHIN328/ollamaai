import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GeneralAI from './components/GeneralAI';
import MinecraftDashboard from './components/minecraft/MinecraftDashboard';
import ModBuilder from './components/minecraft/ModBuilder';
import PluginBuilder from './components/minecraft/PluginBuilder';
import MinecraftCodeAssistant from './components/minecraft/MinecraftCodeAssistant';
import ErrorFixer from './components/minecraft/ErrorFixer';
import CodingDashboard from './components/coding/CodingDashboard';
import CodeGenerator from './components/coding/CodeGenerator';
import Debugger from './components/coding/Debugger';
import CodeExplainer from './components/coding/CodeExplainer';
import Optimizer from './components/coding/Optimizer';
import LinuxAssistant from './components/coding/LinuxAssistant';
import Settings from './components/Settings';
import { checkHealth } from './utils/api';
import { getSettings, AppSettings } from './utils/storage';

export type Page =
  | 'general'
  | 'minecraft'
  | 'minecraft-mod'
  | 'minecraft-plugin'
  | 'minecraft-code'
  | 'minecraft-errors'
  | 'coding'
  | 'coding-generator'
  | 'coding-debugger'
  | 'coding-explainer'
  | 'coding-optimizer'
  | 'coding-linux'
  | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('general');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  useEffect(() => {
    const checkStatus = async () => {
      setOllamaStatus('checking');
      const result = await checkHealth();
      setOllamaStatus(result.status === 'online' ? 'online' : 'offline');
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'general':
        return <GeneralAI settings={settings} />;
      case 'minecraft':
        return <MinecraftDashboard onNavigate={handleNavigate} />;
      case 'minecraft-mod':
        return <ModBuilder settings={settings} />;
      case 'minecraft-plugin':
        return <PluginBuilder settings={settings} />;
      case 'minecraft-code':
        return <MinecraftCodeAssistant settings={settings} />;
      case 'minecraft-errors':
        return <ErrorFixer settings={settings} />;
      case 'coding':
        return <CodingDashboard onNavigate={handleNavigate} />;
      case 'coding-generator':
        return <CodeGenerator settings={settings} />;
      case 'coding-debugger':
        return <Debugger settings={settings} />;
      case 'coding-explainer':
        return <CodeExplainer settings={settings} />;
      case 'coding-optimizer':
        return <Optimizer settings={settings} />;
      case 'coding-linux':
        return <LinuxAssistant settings={settings} />;
      case 'settings':
        return <Settings settings={settings} onSettingsChange={setSettings} />;
      default:
        return <GeneralAI settings={settings} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        ollamaStatus={ollamaStatus}
        model={settings.model}
      />
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-[#27272a] bg-[#111113]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#222225] text-zinc-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-zinc-300">AI Hub</span>
          <div className="w-8" />
        </div>
        <div className="flex-1 overflow-hidden">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
