import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { LeadStoreProvider } from './contexts/LeadStoreContext';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <ApiKeyProvider>
      <LeadStoreProvider>
        <div className="min-h-screen bg-[#f5f5f7] font-sans selection:bg-blue-500/20 selection:text-slate-900">
          <ApiKeyModal />
          <Dashboard />
        </div>
      </LeadStoreProvider>
    </ApiKeyProvider>
  );
}

export default App;
