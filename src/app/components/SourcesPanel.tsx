'use client';

import { useState } from 'react';

// Use shared types from companyData to avoid duplication

interface SourcesPanelProps {
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
}

import { COMPANY_DATA, type SourceGroup } from './companyData';

export default function SourcesPanel({ selectedSources, onSourcesChange }: SourcesPanelProps) {
  const [sourceGroups, setSourceGroups] = useState<SourceGroup[]>(COMPANY_DATA);
  const [selectAll, setSelectAll] = useState(false);

  const getAllSources = () => {
    return sourceGroups.flatMap(group => group.sources);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const updatedGroups = sourceGroups.map(group => ({
      ...group,
      sources: group.sources.map(source => ({
        ...source,
        checked: newSelectAll
      }))
    }));
    setSourceGroups(updatedGroups);
    
    if (newSelectAll) {
      const allSources = getAllSources();
      onSourcesChange(allSources.map(s => s.id));
    } else {
      onSourcesChange([]);
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    const updatedGroups = sourceGroups.map(group => ({
      ...group,
      sources: group.sources.map(source => 
        source.id === sourceId 
          ? { ...source, checked: !source.checked }
          : source
      )
    }));
    setSourceGroups(updatedGroups);
    
    const allSources = updatedGroups.flatMap(group => group.sources);
    const checkedSources = allSources.filter(s => s.checked).map(s => s.id);
    onSourcesChange(checkedSources);
    
    // Update select all state
    const allChecked = allSources.every(s => s.checked);
    setSelectAll(allChecked);
  };

  const handleGroupToggle = (groupId: string) => {
    const updatedGroups = sourceGroups.map(group => {
      if (group.id === groupId) {
        const groupAllChecked = group.sources.every(s => s.checked);
        const newChecked = !groupAllChecked;
        return {
          ...group,
          sources: group.sources.map(source => ({
            ...source,
            checked: newChecked
          }))
        };
      }
      return group;
    });
    setSourceGroups(updatedGroups);
    
    const allSources = updatedGroups.flatMap(group => group.sources);
    const checkedSources = allSources.filter(s => s.checked).map(s => s.id);
    onSourcesChange(checkedSources);
    
    // Update select all state
    const allChecked = allSources.every(s => s.checked);
    setSelectAll(allChecked);
  };

  const toggleGroupExpanded = (groupId: string) => {
    const updatedGroups = sourceGroups.map(group => 
      group.id === groupId 
        ? { ...group, expanded: !group.expanded }
        : group
    );
    setSourceGroups(updatedGroups);
  };

  const getSourceIcon = (type: 'earnings') => {
    return (
      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
        <div className="w-2 h-2 bg-blue-500 rounded"></div>
      </div>
    );
  };

  const getTotalSources = () => {
    return sourceGroups.reduce((total, group) => total + group.sources.length, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium text-slate-800">Sources</h1>
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-2 focus:ring-slate-400 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-600">Select all</span>
          </label>
        </div>
      </div>


      {/* Sources List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-1">
          {sourceGroups.map((group) => {
            const groupAllChecked = group.sources.every(s => s.checked);
            const groupSomeChecked = group.sources.some(s => s.checked);
            const checkedCount = group.sources.filter(s => s.checked).length;
            
            return (
              <div key={group.id} className="bg-white rounded-lg border border-slate-200">
                {/* Group Header */}
                <div className="px-4 py-3 rounded-t-lg border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleGroupExpanded(group.id)}
                      className="flex items-center space-x-3 flex-1 text-left"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg 
                          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                            group.expanded ? 'rotate-90' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                          {group.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-600 font-medium">
                          {checkedCount}/{group.sources.length}
                        </span>
                      </div>
                    </button>
                    <div className="ml-3">
                      <input
                        type="checkbox"
                        checked={groupAllChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = groupSomeChecked && !groupAllChecked;
                        }}
                        onChange={() => handleGroupToggle(group.id)}
                        className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-2 focus:ring-slate-400 focus:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Group Sources */}
                {group.expanded && (
                  <div className="bg-slate-50/50">
                    {group.sources.map((source) => (
                      <div key={source.id} className="border-l-2 border-slate-200 ml-4">
                        <label className="flex items-center pl-6 pr-4 py-2.5 cursor-pointer group hover:bg-white/80 transition-colors">
                          <input
                            type="checkbox"
                            checked={source.checked}
                            onChange={() => handleSourceToggle(source.id)}
                            className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-2 focus:ring-slate-400 focus:ring-offset-0 shrink-0"
                          />
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center min-w-0 flex-1">
                                <span className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                                  {source.name}
                                </span>
                              </div>
                              <div className="ml-3 flex-shrink-0">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-white text-slate-500 border border-slate-200 group-hover:border-slate-300">
                                  {source.ticker}
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
