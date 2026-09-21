import { useState, useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { ChatMessage, sendChat } from '../utils/api';
import { ChatSession, getChats, saveChats, createChatId, AppSettings } from '../utils/storage';

interface ChatInterfaceProps {
  section: string;
  systemPrompt: string;
  settings: AppSettings;
  title: string;
  icon: string;
  placeholder?: string;
  quickActions?: { label: string; prompt: string }[];
}

export default function ChatInterface({
  section,
  systemPrompt,
  settings,
  title,
  icon,
  placeholder = 'Type your message...',
  quickActions,
}: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => getChats(section));
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (sessions.length > 0 && !activeSession) {
      setActiveSession(sessions[0]);
    }
  }, []);

  useEffect(() => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, streamingContent, settings.autoScroll]);

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: createChatId(),
      title: 'New Chat',
      section,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveChats(section, updated);
    setActiveSession(newSession);
  }, [section, sessions]);

  const deleteChat = useCallback((id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveChats(section, updated);
    if (activeSession?.id === id) {
      setActiveSession(updated[0] || null);
    }
  }, [sessions, activeSession]);

  const renameChat = useCallback((id: string, newTitle: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    setSessions(updated);
    saveChats(section, updated);
    if (activeSession?.id === id) {
      setActiveSession({ ...activeSession, title: newTitle });
    }
  }, [sessions, activeSession]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent || isLoading) return;

    let currentSession = activeSession;
    if (!currentSession) {
      const newSession: ChatSession = {
        id: createChatId(),
        title: messageContent.slice(0, 40),
        section,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentSession = newSession;
      setActiveSession(newSession);
    }

    const userMessage: ChatMessage = { role: 'user', content: messageContent };
    const updatedMessages = [...(currentSession.messages || []), userMessage];

    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      title: currentSession.messages.length === 0 ? messageContent.slice(0, 40) : currentSession.title,
      updatedAt: Date.now(),
    };

    setActiveSession(updatedSession);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const messagesWithSystem: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages,
      ];

      const response = await sendChat(
        messagesWithSystem,
        { model: settings.model, temperature: settings.temperature, stream: true },
        (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        abortController.signal
      );

      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalSession = { ...updatedSession, messages: finalMessages, updatedAt: Date.now() };

      setActiveSession(finalSession);
      const updatedSessions = sessions.map(s => s.id === finalSession.id ? finalSession : s);
      if (!sessions.find(s => s.id === finalSession.id)) {
        updatedSessions.unshift(finalSession);
      }
      setSessions(updatedSessions);
      saveChats(section, updatedSessions);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const partialMessage: ChatMessage = { role: 'assistant', content: streamingContent || '(Generation stopped)' };
        const finalMessages = [...updatedMessages, partialMessage];
        const finalSession = { ...updatedSession, messages: finalMessages };
        setActiveSession(finalSession);
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Failed to get response. Make sure Ollama is running.'}`,
        };
        const finalMessages = [...updatedMessages, errorMessage];
        const finalSession = { ...updatedSession, messages: finalMessages };
        setActiveSession(finalSession);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [input, isLoading, activeSession, section, systemPrompt, settings, sessions, streamingContent]);

  const regenerateResponse = useCallback(async () => {
    if (!activeSession || activeSession.messages.length < 2) return;
    const messages = activeSession.messages.slice(0, -1);
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role !== 'user') return;

    const updatedSession = { ...activeSession, messages };
    setActiveSession(updatedSession);
    setInput(lastUserMsg.content);
    setTimeout(() => sendMessage(lastUserMsg.content), 100);
  }, [activeSession, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (settings.enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderMarkdown = (content: string) => {
    try {
      return { __html: marked(content, { breaks: true }) };
    } catch {
      return { __html: content };
    }
  };

  const messages = activeSession?.messages || [];

  return (
    <div className="flex h-full">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-64 border-r border-[#27272a] bg-[#0d0d0f] flex flex-col">
          <div className="p-3 border-b border-[#27272a] flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Chat History</span>
            <button onClick={createNewChat} className="p-1 rounded hover:bg-[#222225] text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm ${
                  activeSession?.id === session.id ? 'bg-[#222225] text-white' : 'text-zinc-400 hover:bg-[#1a1a1d]'
                }`}
                onClick={() => setActiveSession(session)}
              >
                <span className="flex-1 truncate">{session.title || 'Untitled'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-4">No chats yet</p>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#111113]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 rounded-lg hover:bg-[#222225] text-zinc-400"
              title="Toggle history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg">{icon}</span>
            <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createNewChat}
              className="px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-300 text-xs font-medium transition-colors"
            >
              + New Chat
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  const cleared = { ...activeSession!, messages: [] };
                  setActiveSession(cleared);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#222225] hover:bg-[#2a2a2d] text-zinc-300 text-xs font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-4xl mb-4">{icon}</span>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 max-w-md mb-6">
                Start a conversation or use one of the quick actions below.
              </p>
              {quickActions && (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(action.prompt)}
                      className="px-3 py-2 rounded-lg bg-[#1a1a1d] border border-[#27272a] hover:border-purple-500/30 hover:bg-[#222225] text-zinc-300 text-xs transition-all"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`animate-fade-in ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] bg-[#7c3aed] text-white px-4 py-3 rounded-2xl rounded-br-md text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[90%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-500">AI</span>
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="p-1 rounded hover:bg-[#222225] text-zinc-500 hover:text-zinc-300"
                        title="Copy"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div
                      className="markdown-content text-sm text-zinc-200"
                      dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Streaming response */}
            {isLoading && streamingContent && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-zinc-500">AI</span>
                </div>
                <div
                  className="markdown-content text-sm text-zinc-200"
                  dangerouslySetInnerHTML={renderMarkdown(streamingContent)}
                />
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <div className="animate-fade-in flex items-center gap-2">
                <span className="text-xs text-zinc-500">AI is thinking</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full typing-dot" />
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full typing-dot" />
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full typing-dot" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#27272a] bg-[#111113] p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-[#1a1a1d] border border-[#27272a] rounded-xl p-3 focus-within:border-purple-500/40 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 resize-none outline-none min-h-[24px] max-h-[120px]"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              {isLoading ? (
                <button
                  onClick={stopGeneration}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Stop generation"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>
            {messages.length > 0 && !isLoading && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={regenerateResponse}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ↻ Regenerate response
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
