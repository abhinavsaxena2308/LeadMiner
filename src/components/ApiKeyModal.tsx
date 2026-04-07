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
      <div className="absolute inset-0 bg-[#0b0f1a]/95 backdrop-blur-2xl">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md"
      >
        {/* Glow ring */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/30 via-transparent to-sky-500/20 pointer-events-none" />

        <div className="relative glass rounded-3xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-indigo-400" />
              </div>
              {/* Shine */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Connect Apify
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
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
              className="relative w-full group overflow-hidden rounded-xl py-3.5 font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-sky-500 group-hover:from-indigo-500 group-hover:to-sky-400 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your key is stored locally in your browser only</span>
            </div>
            <div className="flex items-center justify-center">
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
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
