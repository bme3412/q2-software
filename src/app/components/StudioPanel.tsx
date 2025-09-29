'use client';

import { useState, useEffect } from 'react';

interface Snippet {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: string;
  tags: string[];
}

export default function StudioPanel() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());

  // Load snippets from localStorage on component mount
  useEffect(() => {
    const savedSnippets = localStorage.getItem('earnings-snippets');
    if (savedSnippets) {
      setSnippets(JSON.parse(savedSnippets));
    }
  }, []);

  // Save snippets to localStorage whenever snippets change
  useEffect(() => {
    localStorage.setItem('earnings-snippets', JSON.stringify(snippets));
  }, [snippets]);

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== id));
  };

  const exportSnippets = () => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earnings-snippets-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const toggleExpanded = (snippetId: string) => {
    const newExpanded = new Set(expandedSnippets);
    if (newExpanded.has(snippetId)) {
      newExpanded.delete(snippetId);
    } else {
      newExpanded.add(snippetId);
    }
    setExpandedSnippets(newExpanded);
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-slate-800">Research Library</h1>
            <p className="text-xs text-slate-600">{snippets.length} saved insights</p>
          </div>
          <button
            onClick={exportSnippets}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            📥 Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {snippets.length === 0 ? (
              <div>
                <p className="text-lg mb-2">📋 No snippets saved yet</p>
                <p className="text-sm">Save insights from your analyses to build your research library</p>
              </div>
            ) : (
              <p>No snippets match your search</p>
            )}
          </div>
        ) : (
            <div className="space-y-4">
              {filteredSnippets.map(snippet => {
                const isExpanded = expandedSnippets.has(snippet.id);
                const contentPreview = snippet.content.length > 200 ? snippet.content.substring(0, 200) + '...' : snippet.content;
                
                return (
                  <div key={snippet.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 text-sm leading-tight">{snippet.title}</h3>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => copyToClipboard(snippet.content)}
                          className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteSnippet(snippet.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Delete snippet"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-md p-3 mb-3">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {isExpanded ? snippet.content : contentPreview}
                      </p>
                      {snippet.content.length > 200 && (
                        <button
                          onClick={() => toggleExpanded(snippet.id)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {isExpanded ? '▲ Show less' : '▼ Show more'}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📊 Sources:</span>
                        <span className="truncate">{snippet.source}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{new Date(snippet.timestamp).toLocaleDateString()}</span>
                        <div className="flex gap-1">
                          {snippet.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>
    </div>
  );
}