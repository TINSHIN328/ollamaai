import ChatInterface from './ChatInterface';
import { SYSTEM_PROMPTS } from '../utils/prompts';
import { AppSettings } from '../utils/storage';

interface Props {
  settings: AppSettings;
}

export default function GeneralAI({ settings }: Props) {
  return (
    <ChatInterface
      section="general"
      systemPrompt={SYSTEM_PROMPTS.general}
      settings={settings}
      title="General AI"
      icon="💬"
      placeholder="Ask me anything..."
      quickActions={[
        { label: 'Explain a topic', prompt: 'Explain the following topic in simple terms: ' },
        { label: 'Help me write', prompt: 'Help me write: ' },
        { label: 'Translate', prompt: 'Translate the following to English: ' },
        { label: 'Summarize', prompt: 'Summarize the following: ' },
        { label: 'Brainstorm', prompt: 'Brainstorm ideas for: ' },
        { label: 'Problem solving', prompt: 'Help me solve this problem: ' },
      ]}
    />
  );
}
