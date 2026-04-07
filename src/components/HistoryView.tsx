import React from 'react';
import { useLeadStore, type ScrapeJob } from '../contexts/LeadStoreContext';
import { Clock, Search, MapPin, Database, Trash2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryViewProps {
  onReloadJob: (job: ScrapeJob) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onReloadJob }) => {
  const { jobs, deleteJob } = useLeadStore();

  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass rounded-[28px]">
        <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
          <Clock className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No History Yet</h3>
        <p className="text-slate-500 max-w-xs">Your past scrape jobs will appear here so you can revisit findings without re-running them.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Scrape History</h2>
        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm">
          {jobs.length} Runs Total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-5 rounded-2xl group hover-lift relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <button 
                onClick={() => deleteJob(job.id)}
                className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-[15px] font-bold text-slate-900 mb-1 truncate">{job.query}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{job.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-black/[0.04]">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Leads</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  {job.resultsCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                <p className="text-[11px] font-medium text-slate-600">
                  {new Date(job.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => onReloadJob(job)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-premium-md"
            >
              Reload Results
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
