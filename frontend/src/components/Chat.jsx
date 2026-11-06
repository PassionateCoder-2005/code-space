import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Zap, ChevronDown } from 'lucide-react';

function SSEMessage({ content, role, isStreaming }) {
  // Parse structured SSE log lines from AI stream
  const lines = content.split('\n').filter(Boolean);

  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          role === 'user' ? 'bg-violet-600' : 'bg-gray-700'
        }`}
      >
        {role === 'user' ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-violet-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          role === 'user'
            ? 'bg-violet-600 text-white rounded-tr-sm'
            : 'bg-gray-800 text-gray-200 rounded-tl-sm'
        }`}
      >
        {lines.map((line, i) => {
          // Detect status lines like "Listing files in the project directory"
          const isStatus =
            line.startsWith('Listing') ||
            line.startsWith('Reading') ||
            line.startsWith('Updating') ||
            line.startsWith('Files') ||
            line.startsWith('Connected');
          return (
            <p key={i} className={isStatus ? 'text-xs text-gray-500 italic mb-1' : 'mb-1'}>
              {line}
            </p>
          );
        })}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse rounded-sm ml-1" />
        )}
      </div>
    </div>
  );
}

export default function Chat({ sandbox }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Sandbox ready! 🚀\n\nI can help you build any frontend you want. Just describe what you'd like to create and I'll generate the code for you.\n\nTry: "Make a todo app with dark mode" or "Build a landing page for a coffee shop"`,
      id: 'welcome',
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    setStreaming(true);

    // Add user message
    const userMsg = { role: 'user', content: text, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMsg]);

    // Placeholder for AI streaming response
    const aiMsgId = `ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', id: aiMsgId, isStreaming: true },
    ]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          projectId: sandbox.sandboxId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') continue;
            try {
              const parsed = JSON.parse(rawData);
              // Handle different SSE payload shapes
              const text =
                parsed.text ||
                parsed.content ||
                parsed.message ||
                parsed.delta?.content ||
                (typeof parsed === 'string' ? parsed : '');
              if (text) {
                accumulatedContent += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              }
            } catch {
              // Plain text line
              if (rawData) {
                accumulatedContent += rawData + '\n';
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              }
            }
          } else if (line.trim() && !line.startsWith(':')) {
            // Non-SSE plain text
            accumulatedContent += line + '\n';
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: accumulatedContent }
                  : m
              )
            );
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: `Error: ${err.message}`,
                  isError: true,
                }
              : m
          )
        );
      }
    } finally {
      setStreaming(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
      );
    }
  }, [input, streaming, sandbox]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="bg-violet-600 p-1.5 rounded-lg">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">AI Assistant</p>
          <p className="text-gray-500 text-xs">
            {sandbox.sandboxId.slice(0, 8)}…
          </p>
        </div>
        {streaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
            <span className="text-violet-400 text-xs">Generating…</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <SSEMessage
            key={msg.id}
            content={msg.content}
            role={msg.role}
            isStreaming={msg.isStreaming}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900 shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build…"
              rows={1}
              className="w-full bg-gray-800 border border-gray-700 focus:border-violet-500 text-gray-200 placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors leading-relaxed"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
            />
          </div>
          {streaming ? (
            <button
              onClick={stopStream}
              className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl transition-colors shrink-0"
              title="Stop generation"
            >
              <span className="w-4 h-4 block bg-white rounded-sm" />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shrink-0"
              title="Send (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-gray-600 text-xs mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

