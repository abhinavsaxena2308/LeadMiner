import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Loader2, Filter,
  LogOut, Zap, TrendingUp, Database, Clock,
  ChevronDown, ChevronUp, Globe, Phone, Star
} from 'lucide-react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { startScrapeJob, checkScrapeStatus, fetchDatasetItems, type ScrapeFilters } from '../services/apify';
import { ResultsTable } from './ResultsTable';

// ── Reusable Toggle ────────────────────────────────────────────────
const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}> = ({ checked, onChange, color = 'bg-indigo-500' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${checked ? color : 'bg-white/10'}`}
  >
    <span className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }> = ({
  icon, label, value, sub, color,
}) => (
  <div className="glass rounded-2xl p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { apiKey, clearApiKey } = useApiKey();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('IDLE');
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const [filters, setFilters] = useState<ScrapeFilters>({
    query: 'Restaurants',
    location: 'New York, NY',
    maxResults: 20,
    noWebsite: false,
    minRating: 0,
    hasPhone: false,
    hasEmail: false,
    openNow: false,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let logInterval: NodeJS.Timeout;
    if (status === 'RUNNING' || status === 'FETCHING') {
      interval = setInterval(() => setTimeElapsed(p => p + 1), 1000);
      
      if (status === 'RUNNING') {
        const mockLogs = [
          "Resolving Google Maps endpoints...",
          "Bypassing rate limits...",
          "Extracting business profiles...",
          "Parsing contact details (phone, website)...",
          "Scraping review data...",
          "Identifying potential web development targets...",
          "Analyzing SERP results...",
          "Paginating through map clusters...",
          "Cross-referencing domain availability...",
          "Decoding geolocation hashes..."
        ];
        logInterval = setInterval(() => {
          const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
          setLogs(prev => {
             const timeStr = new Date().toISOString().split('T')[1].slice(0,8);
             const newLogs = [...prev, `[${timeStr}] [INFO] ${randomLog}`];
             return newLogs.slice(-25); // Keep last 25 lines
          });
        }, 1200);
      }
    } else {
      setTimeElapsed(0);
    }
    return () => {
      clearInterval(interval);
      if (logInterval) clearInterval(logInterval);
    };
  }, [status]);

  const handleScrape = async () => {
    if (!apiKey) return;
    setLoading(true);
    setStatus('RUNNING');
    setErrorMsg('');
    setResults([]);
    setSidebarOpen(false);

    const t = () => new Date().toISOString().split('T')[1].slice(0,8);
    setLogs([
      `[${t()}] [SYSTEM] Initializing LeadMiner engine v2.0...`,
      `[${t()}] [CONFIG] Target: "${filters.query}" in "${filters.location}"`,
    ]);

    try {
      const runId = await startScrapeJob(apiKey, filters);
      setLogs(prev => [...prev.slice(-24), `[${t()}] [APIFY] Spawning worker actor. Run ID: ${runId}`]);
      
      let isRunning = true;
      let finalDatasetId = '';

      while (isRunning) {
        await new Promise(r => setTimeout(r, 5000));
        const statusData = await checkScrapeStatus(apiKey, runId);
        if (statusData.status === 'SUCCEEDED') {
          isRunning = false;
          finalDatasetId = statusData.datasetId;
        } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(statusData.status)) {
          throw new Error(`Scraper run failed with status: ${statusData.status}`);
        } else {
          setLogs(prev => [...prev.slice(-24), `[${t()}] [SYSTEM] Worker status: ${statusData.status}...`]);
        }
      }

      setLogs(prev => [...prev.slice(-24), `[${t()}] [SYSTEM] Run complete. Finalizing dataset ${finalDatasetId}...`]);
      setStatus('FETCHING');
      const items = await fetchDatasetItems(apiKey, finalDatasetId);
      const filtered = items.filter(item => {
        if (filters.noWebsite && item.website) return false;
        if (filters.hasPhone && !item.phone) return false;
        if (filters.minRating > 0 && (item.totalScore || 0) < filters.minRating) return false;
        return true;
      });

      setResults(filtered);
      setStatus('DONE');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during scraping');
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const statsVisible = status === 'DONE' && results.length > 0;
  const noWebsiteCount = results.filter(r => !r.website).length;
  const avgRating = results.length
    ? (results.reduce((a, r) => a + (r.totalScore || 0), 0) / results.length).toFixed(1)
    : '—';
  const withPhoneCount = results.filter(r => r.phone).length;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${!apiKey ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

      {/* ── Top Nav ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-white/70 backdrop-blur-3xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-slate-900 leading-none tracking-tight">LeadMiner<span className="text-blue-500"> AI</span></h1>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">Google Maps Scraper</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Apify status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-semibold tracking-wide">
              <span className="relative flex h-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Apify Connected
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Disconnect */}
            <button
              onClick={clearApiKey}
              title="Change API Key"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">

        {/* ── Sidebar ──────────────────────────────────────── */}
        {/* Desktop always-visible, mobile slide-over */}
        <AnimatePresence>
          {(sidebarOpen || true) && (
            <>
              {/* Mobile overlay */}
              {sidebarOpen && (
                <motion.div
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                />
              )}

              <motion.aside
                key="sidebar"
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`
                  ${sidebarOpen ? 'fixed left-0 top-0 bottom-0 z-30 pt-4 px-4 pb-6 overflow-y-auto' : 'hidden'}
                  lg:relative lg:flex lg:flex-col lg:top-auto lg:left-auto lg:z-auto lg:p-0 lg:overflow-visible
                  w-[300px] shrink-0 space-y-4
                `}
              >
                {/* ── Search Panel ── */}
                <div className="glass rounded-2xl p-5 space-y-4 animate-slide-up" style={{ animationDelay: '0ms' }}>
                  <h2 className="section-title">
                    <Search className="w-4 h-4 text-blue-500" />
                    Search Query
                  </h2>

                  <div>
                    <label className="sidebar-label">Business Type</label>
                    <input
                      type="text"
                      value={filters.query}
                      onChange={e => setFilters({ ...filters, query: e.target.value })}
                      placeholder="e.g. Plumbers, Restaurants"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="sidebar-label">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={e => setFilters({ ...filters, location: e.target.value })}
                      placeholder="e.g. New York, NY"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="sidebar-label mb-0">Max Results</label>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-[6px]">
                        {filters.maxResults}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1" max="200"
                      value={filters.maxResults}
                      onChange={e => setFilters({ ...filters, maxResults: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                      <span>1</span><span>200</span>
                    </div>
                  </div>
                </div>

                {/* ── Filters Panel ── */}
                <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '60ms' }}>
                  <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-black/[0.01] transition-colors"
                  >
                    <h2 className="section-title mb-0">
                      <Filter className="w-4 h-4 text-blue-500" />
                      Smart Filters
                    </h2>
                    {filtersExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {filtersExpanded && (
                      <motion.div
                        key="filters"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4 border-t border-black/[0.04] pt-4">
                          {/* No Website toggle */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-sm font-semibold text-slate-800">No Website</span>
                                <span className="text-[9px] font-bold bg-orange-100 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest">Hot</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 ml-5.5">Best for web dev outreach</p>
                            </div>
                            <Toggle checked={filters.noWebsite} onChange={v => setFilters({ ...filters, noWebsite: v })} color="bg-orange-500" />
                          </div>

                          <div className="h-px bg-black/[0.04]" />

                          {/* Has Phone */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-sm font-medium text-slate-700">Has Phone Number</span>
                            </div>
                            <Toggle checked={filters.hasPhone} onChange={v => setFilters({ ...filters, hasPhone: v })} color="bg-emerald-500" />
                          </div>

                          <div className="h-px bg-black/[0.04]" />

                          {/* Min Rating */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Star className="w-3.5 h-3.5 text-yellow-500" />
                                <span className="text-sm font-medium text-slate-700">Min Rating</span>
                              </div>
                              <span className="text-[11px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded-[6px]">
                                {filters.minRating === 0 ? 'Any' : `${filters.minRating}★`}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0" max="5" step="0.5"
                              value={filters.minRating}
                              onChange={e => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                              className="w-full accent-yellow-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                              <span>Any</span><span>5★</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── CTA Button ── */}
                <button
                  onClick={handleScrape}
                  disabled={loading || !filters.query}
                  className="animate-slide-up w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 shadow-md group"
                  style={{ animationDelay: '120ms' }}
                >
                  <span className="relative flex items-center justify-center gap-2.5">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{status === 'FETCHING' ? 'Fetching Data…' : `Mining Leads… ${formatTime(timeElapsed)}`}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform" />
                        <span>Start Lead Engine</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Error */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-2xl leading-relaxed"
                    >
                      ⚠️ {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Stats row — only visible after results */}
          <AnimatePresence>
            {statsVisible && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <StatCard
                  icon={<Database className="w-5 h-5 text-blue-500" />}
                  label="Total Leads"
                  value={results.length}
                  sub="results found"
                  color="bg-blue-50 border border-blue-100"
                />
                <StatCard
                  icon={<Globe className="w-5 h-5 text-orange-500" />}
                  label="No Website"
                  value={noWebsiteCount}
                  sub="web dev targets"
                  color="bg-orange-50 border border-orange-100"
                />
                <StatCard
                  icon={<Star className="w-5 h-5 text-yellow-500" />}
                  label="Avg Rating"
                  value={avgRating}
                  sub="stars average"
                  color="bg-yellow-50 border border-yellow-100"
                />
                <StatCard
                  icon={<Phone className="w-5 h-5 text-emerald-500" />}
                  label="Has Phone"
                  value={withPhoneCount}
                  sub="contact notes"
                  color="bg-emerald-50 border border-emerald-100"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Console Output Window */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/10"
              >
                {/* Console header */}
                <div className="bg-slate-50 border-b border-black/[0.04] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm" />
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-black/[0.03] rounded-md border border-black/[0.05]">
                       <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                       <span className="text-xs font-mono font-medium text-slate-600">
                         {status === 'FETCHING' ? 'root@leadminer:~/dataset/fetch' : 'root@leadminer:~/engine/scrape'}
                       </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/[0.03] border border-black/[0.05] px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono font-bold text-blue-600">{formatTime(timeElapsed)}</span>
                  </div>
                </div>
                
                {/* Console body */}
                <div className="p-5 font-mono text-[11px] md:text-[13px] leading-relaxed text-slate-700 h-[280px] overflow-y-auto flex flex-col justify-end bg-white/80 backdrop-blur-3xl relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="space-y-1.5 w-full relative z-10 transition-all duration-300">
                    {logs.map((log, i) => {
                      const isError = log.includes('[ERROR]');
                      const isSystem = log.includes('[SYSTEM]');
                      const isConfig = log.includes('[CONFIG]');
                      const isApify = log.includes('[APIFY]');
                      
                      let colorClass = 'text-slate-500';
                      if (isError) colorClass = 'text-red-500 font-semibold';
                      else if (isSystem) colorClass = 'text-blue-600 font-semibold';
                      else if (isConfig) colorClass = 'text-emerald-600';
                      else if (isApify) colorClass = 'text-indigo-600 font-medium';

                      return (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`break-all ${colorClass} flex gap-2`}
                        >
                          <span className="text-slate-400 select-none">{'>'}</span>
                          <span>{log}</span>
                        </motion.div>
                      );
                    })}
                    {/* Blinking cursor */}
                    <div className="flex gap-2 items-center">
                      <span className="text-slate-400 select-none">{'>'}</span>
                      <motion.div 
                        key="cursor"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="inline-block w-2 bg-blue-500 h-3.5 align-middle shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                {/* Indeterminate bar at the bottom */}
                <div className="w-full h-1 bg-white/[0.02]">
                  <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-sky-400 shimmer" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results / Empty state */}
          {results.length > 0 ? (
            <ResultsTable data={results} />
          ) : status === 'IDLE' || status === 'ERROR' ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 glass rounded-[28px] flex flex-col items-center justify-center text-center p-12 min-h-[420px]"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-[28px] bg-slate-50 border border-slate-200/60 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-10 h-10 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md border-2 border-white">
                  <Zap className="w-3.5 h-3.5 text-white fill-current" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Ready to mine leads?</h3>
              <p className="text-slate-500 max-w-sm text-[15px] leading-relaxed mb-8">
                Configure your search query and filters in the sidebar, then hit <strong className="font-semibold text-slate-900">Start Lead Engine</strong> to extract real Google Maps data.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {['Restaurants', 'Plumbers', 'Dentists', 'Gyms', 'Lawyers'].map(q => (
                  <button
                    key={q}
                    onClick={() => setFilters(f => ({ ...f, query: q }))}
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </main>
      </div>
    </div>
  );
};
