import ChatInterface from '../ChatInterface';
import { SYSTEM_PROMPTS } from '../../utils/prompts';
import { AppSettings } from '../../utils/storage';

interface Props { settings: AppSettings; }

export default function MinecraftCodeAssistant({ settings }: Props) {
  return (
    <ChatInterface
      section="minecraft-code"
      systemPrompt={SYSTEM_PROMPTS.minecraftCodeAssistant}
      settings={settings}
      title="Minecraft Code Assistant"
      icon="💻"
      placeholder="Ask about Minecraft development..."
      quickActions={[
        { label: 'Explain Code', prompt: 'Explain this Minecraft code:\n\n```java\n\n```' },
        { label: 'Fix Code', prompt: 'Fix this Minecraft code:\n\n```java\n\n```' },
        { label: 'Optimize Code', prompt: 'Optimize this Minecraft code:\n\n```java\n\n```' },
        { label: 'Add Feature', prompt: 'Add a feature to this Minecraft plugin:\n\n```java\n\n```' },
        { label: 'Convert Code', prompt: 'Convert this code from Spigot to Paper API:\n\n```java\n\n```' },
        { label: 'Generate Code', prompt: 'Generate a Minecraft plugin that: ' },
      ]}
    />
  );
}
