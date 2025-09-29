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

interface SnippetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SnippetManager({ isOpen, onClose }: SnippetManagerProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

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

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || snippet.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(snippets.flatMap(snippet => snippet.tags))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Research Snippets</h2>
            <p className="text-sm text-slate-600">{snippets.length} saved insights</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportSnippets}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📥 Export
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-4 mb-3">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Snippets List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
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
              {filteredSnippets.map(snippet => (
                <div key={snippet.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-slate-800">{snippet.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(snippet.content)}
                        className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => deleteSnippet(snippet.id)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3 line-clamp-3">{snippet.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>📊 {snippet.source}</span>
                      <span>•</span>
                      <span>{new Date(snippet.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1">
                      {snippet.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
