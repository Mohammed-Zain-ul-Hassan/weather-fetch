'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, isToolUIPart, getToolName } from 'ai';
import { Cloud, Loader2, Send, Thermometer, User, Wind } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect, useRef, useState } from 'react';
import { WeatherResult } from '@/lib/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Weather AI</h1>
        </div>
      </header>

      {/* Messages */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="p-4 bg-gray-900 rounded-full">
                <Cloud className="w-12 h-12 text-blue-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">How can I help you today?</h2>
                <p className="text-gray-400 mt-2">Ask me about the weather anywhere in the world.</p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                m.role === 'user' ? "bg-blue-600" : "bg-gray-700"
              )}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
              </div>

              <div className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                m.role === 'user' ? "items-end" : "items-start"
              )}>
                {/* Message Content (Parts) */}
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <div key={`${m.id}-text-${i}`} className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        m.role === 'user'
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700 shadow-xl"
                      )}>
                        {part.text}
                      </div>
                    );
                  }

                  // Handle tool calls
                  if (isToolUIPart(part)) {
                    const toolInvocation = part;
                    const { state, toolCallId } = toolInvocation;
                    const toolName = getToolName(toolInvocation);

                    if (toolName === 'getWeather') {
                      if (state === 'input-available' || state === 'input-streaming') {
                        return (
                          <div key={toolCallId} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Checking weather for {(toolInvocation.input as any)?.location || '...'}</span>
                          </div>
                        );
                      }

                      if (state === 'output-available') {
                        const result = toolInvocation.output as WeatherResult;
                        if (result?.error) {
                          return (
                            <div key={toolCallId} className="text-xs text-red-400 bg-red-900/10 px-3 py-1.5 rounded-full border border-red-900/30">
                              Error: {result.error}
                            </div>
                          );
                        }

                        return (
                          <div key={toolCallId} className="grid grid-cols-2 gap-2 w-full mt-2">
                            <div className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl flex items-center gap-3">
                              <Thermometer className="w-4 h-4 text-orange-400" />
                              <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Temp</div>
                                <div className="text-sm font-semibold">{result.temperature}{result.unit}</div>
                              </div>
                            </div>
                            <div className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl flex items-center gap-3">
                              <Wind className="w-4 h-4 text-blue-400" />
                              <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Wind</div>
                                <div className="text-sm font-semibold">{result.windSpeed} m/s</div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {isLoading && !messages[messages.length - 1]?.parts.some(p => p.type === 'tool-getWeather') && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 animate-pulse text-white">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-none p-4 border border-gray-700 shadow-xl">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl text-center text-sm">
              An error occurred: {error.message}
            </div>
          )}
        </div>
      </main>

      {/* Input bar */}
      <footer className="p-4 md:p-6 border-t border-gray-800 bg-[#0a0a0a]">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all placeholder:text-gray-500"
            value={input}
            placeholder="Search weather in New York, London, Tokyo..."
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
          />
          <button
            type="submit"
            disabled={!input.trim() || status !== 'ready'}
            className="absolute right-2 top-2 p-3 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 disabled:scale-100 rounded-xl transition-all text-white shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-600 mt-4 uppercase tracking-widest font-medium">
          Powered by Gemini 2.5 Flash Lite & Vercel AI SDK v6
        </p>
      </footer>
    </div>
  );
}
