'use client';

import { useEffect, useMemo, useState } from 'react';
import SourcesPanel from './components/SourcesPanel';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import { COMPANY_DATA } from './components/companyData';

export default function Home() {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // All sources start unchecked - users must manually select companies

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sources Panel */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <SourcesPanel 
          selectedSources={selectedSources}
          onSourcesChange={setSelectedSources}
        />
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <ChatPanel 
          messages={messages}
          onMessagesChange={setMessages}
          selectedSources={selectedSources}
        />
      </div>

      {/* Studio Panel */}
      <div className="w-80 border-l border-gray-200 flex flex-col">
        <StudioPanel />
      </div>
    </div>
  );
}
