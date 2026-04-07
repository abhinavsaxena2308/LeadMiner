import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ArrowRight, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { useApiKey } from '../contexts/ApiKeyContext';

export const ApiKeyModal: React.FC = () => {
  const { apiKey, saveApiKey, error } = useApiKey();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (apiKey) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setLoading(true);
    await saveApiKey(inputValue.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#f5f5f7]/80 backdrop-blur-md">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md"
      >
        {/* Glow ring - remove for Apple theme or make subtle */}
        <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-black/[0.03] to-transparent pointer-events-none" />

        <div className="relative glass rounded-[28px] p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-black/[0.04] flex items-center justify-center shadow-sm">
                <KeyRound className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
              Connect Apify
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Enter your Apify API key to start generating high-quality Google Maps leads with LeadMiner AI.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="apify_api_xxxxxxxxxxxx"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="input-field glow-focus pl-10 font-mono text-sm"
                required
                autoFocus
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs px-1"
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="relative w-full group overflow-hidden rounded-xl py-3.5 font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-900 hover:bg-slate-800 shadow-md"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Validating…</span></>
                ) : (
                  <><span>Save & Continue</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Your key is stored locally in your browser only</span>
            </div>
            <div className="flex items-center justify-center">
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors font-medium"
              >
                Get your API key from Apify Console
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
