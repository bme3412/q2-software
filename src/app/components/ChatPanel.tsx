'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  selectedSources: string[];
}

export default function ChatPanel({ messages, onMessagesChange, selectedSources }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'detailed' | 'comprehensive'>('detailed');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const saveSnippet = (content: string, title?: string) => {
    const snippet = {
      id: Date.now().toString(),
      title: title || `Analysis - ${new Date().toLocaleDateString()}`,
      content: content.replace(/\*Sources:.*?\*/g, '').trim(), // Remove sources
      source: selectedSources.join(', '),
      timestamp: new Date().toISOString(),
      tags: ['analysis'] // Default tag, could be made dynamic
    };

    // Get existing snippets
    const existingSnippets = JSON.parse(localStorage.getItem('earnings-snippets') || '[]');
    
    // Add new snippet
    const updatedSnippets = [snippet, ...existingSnippets];
    
    // Save to localStorage
    localStorage.setItem('earnings-snippets', JSON.stringify(updatedSnippets));
    
    // Show success feedback (could be improved with toast notification)
    alert('Snippet saved to your research library!');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSuggestions = useCallback(async () => {
    if (selectedSources.length === 0) return;
    
    setLoadingSuggestions(true);
    try {
      const res = await fetch('/api/suggest-questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ selectedSources })
      });
      const data = await res.json();
      setSuggestedQuestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestedQuestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [selectedSources]);

  // Fetch suggestions when sources change
  useEffect(() => {
    if (selectedSources.length > 0 && messages.length === 0) {
      fetchSuggestions();
    }
  }, [selectedSources, messages.length, fetchSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    onMessagesChange(newMessages);
    setInputValue('');
    setIsLoading(true);

    console.log('Sending request with:', { 
      message: userMessage.content, 
      selectedSources, 
      detail: detailLevel 
    });

    try {
      const res = await fetch('/api/pinecone-rag', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content, 
          selectedSources,
          detail: detailLevel
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${data.error || 'Unknown error'}`);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data?.answer || 'No answer received from API.'
      };
      onMessagesChange([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const assistantMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'There was an error retrieving context. Please try again.'}`
      };
      onMessagesChange([...newMessages, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    // Optionally auto-submit
    // handleSubmit(new Event('submit') as any);
  };


  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Earnings Analysis</h2>
          <p className="text-sm text-slate-600">AI-powered investment research</p>
        </div>
      </div>
      

      {/* Content Area with bottom padding for fixed input */}
      <div className="flex-1 overflow-hidden">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center p-8 pt-4 space-y-6">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
              </div>
              
              {/* Content */}
              <div className="relative">
                
                <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                  Q2 2025 Software Earnings Analysis
                </h1>
                
              </div>
            </div>

            {/* Description */}
            <div className="max-w-5xl mx-auto">
              <p className="text-slate-600 text-base leading-relaxed">
                Dive deep into the <span className="font-semibold text-slate-800">state of the software industry</span> with this collection of Q2 2025 earnings reports 
                for leading technology companies. Investors and financial analysts can ask detailed 
                questions about companies and industries they&apos;re tracking to surface key insights on macro-trends like{' '}
                <span className="font-semibold text-slate-800">AI adoption or subscription growth</span>. Get insights on specific sectors like{' '}
                <span className="font-semibold text-slate-800">SaaS platforms, cybersecurity, or developer tools</span>.
              </p>
            </div>

          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => saveSnippet(message.content)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        📋 Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="border-t border-slate-200 px-8 py-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Detail Level Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Response Detail Level</label>
            <div className="flex space-x-2">
              {[
                { value: 'brief', label: 'Brief', desc: '3-5 key points' },
                { value: 'detailed', label: 'Detailed', desc: 'Standard analysis' },
                { value: 'comprehensive', label: 'Comprehensive', desc: 'Full context' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDetailLevel(option.value as 'brief' | 'detailed' | 'comprehensive')}
                  className={`flex-1 p-3 text-sm rounded-lg border transition-colors ${
                    detailLevel === option.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Input */}
          <div className="relative bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="flex items-center justify-between">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Start typing..."
                className="flex-1 bg-transparent border-none text-lg placeholder-slate-400 focus:outline-none"
              />
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-500 font-medium">
                  {selectedSources.length} sources
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          {/* Dynamic Suggested Questions - Only show when no messages */}
          {messages.length === 0 && loadingSuggestions ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <div className="text-slate-500 text-sm">Generating contextual questions...</div>
              </div>
            </div>
          ) : messages.length === 0 && suggestedQuestions.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-500 mb-3">
                Suggested Questions ({selectedSources.length} companies selected)
              </div>
              {suggestedQuestions.slice(0, 4).map((question, index) => (
                <div 
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-slate-700 text-sm flex-1 pr-2">
                      {question}
                    </div>
                    <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Refresh suggestions button */}
              <button
                onClick={fetchSuggestions}
                className="w-full text-xs text-slate-500 hover:text-blue-600 py-2 transition-colors"
              >
                Refresh suggestions for current selection
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}