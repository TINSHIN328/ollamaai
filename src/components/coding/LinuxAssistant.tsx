import ChatInterface from '../ChatInterface';
import { SYSTEM_PROMPTS } from '../../utils/prompts';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

export default function LinuxAssistant({ settings }: Props) {
  return (
    <ChatInterface
      section="coding-linux"
      systemPrompt={SYSTEM_PROMPTS.linuxAssistant}
      settings={settings}
      title="Linux/Terminal Assistant"
      icon="🐧"
      placeholder="Ask about Linux commands, Docker, networking..."
      quickActions={[
        { label: 'System info', prompt: 'What commands show system information (CPU, RAM, disk, OS)?' },
        { label: 'Docker help', prompt: 'How do I manage Docker containers? Show common docker commands.' },
        { label: 'Fix permissions', prompt: 'How do I fix file permissions in Linux? Explain chmod and chown.' },
        { label: 'Network debug', prompt: 'How do I debug network issues in Linux? Show useful commands.' },
        { label: 'systemd service', prompt: 'How do I create and manage a systemd service?' },
        { label: 'SSH setup', prompt: 'How do I set up SSH key authentication?' },
        { label: 'Disk space', prompt: 'My disk is full. How do I find what is using space and clean up?' },
        { label: 'Process management', prompt: 'How do I find and kill a process that is using too much CPU or memory?' },
      ]}
    />
  );
}
