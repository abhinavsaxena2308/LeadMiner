import React from 'react';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <ApiKeyProvider>
      <div className="min-h-screen bg-[#0b0f1a] font-sans selection:bg-indigo-500/30 selection:text-white">
        <ApiKeyModal />
        <Dashboard />
      </div>
    </ApiKeyProvider>
  );
}

export default App;
