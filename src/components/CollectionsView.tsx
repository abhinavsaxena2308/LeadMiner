import React, { useState } from 'react';
import { useLeadStore, type Collection } from '../contexts/LeadStoreContext';
import { FolderPlus, Trash2, ArrowRight, Database, FolderPen, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollectionsViewProps {
  onOpenCollection: (id: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({ onOpenCollection }) => {
  const { collections, createCollection, deleteCollection } = useLeadStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    createCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
    setShowCreate(false);
  };

  if (collections.length === 0 && !showCreate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass rounded-[28px]">
        <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
          <FolderPlus className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Collections</h3>
        <p className="text-slate-500 max-w-xs mb-8">Organize your leads into collections like "NYC Restaurants" or "LA Gyms" to stay focused on your outreach.</p>
        <button 
          onClick={() => setShowCreate(true)}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-premium-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create First Collection
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Collections</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your prospects and tracking status.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-colors shadow-premium-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {showCreate && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreate}
              className="glass p-6 rounded-2xl border-blue-200/50 bg-blue-50/10 shadow-premium-md"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <FolderPlus className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">New Collection</span>
                </div>
                <button type="button" onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="sidebar-label">Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. NYC Plumbers"
                    className="input-field"
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="sidebar-label">Description (Optional)</label>
                  <textarea 
                    placeholder="Project details..."
                    className="input-field min-h-[80px]"
                    value={newColDesc}
                    onChange={e => setNewColDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm shadow-md hover:bg-blue-600 transition-colors">
                  Create Collection
                </button>
              </div>
            </motion.form>
          )}

          {collections.map((col) => (
            <motion.div
              key={col.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 rounded-2xl group hover-lift relative shadow-premium-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <FolderPen className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <button 
                  onClick={() => deleteCollection(col.id)}
                  className="p-2 rounded-lg text-slate-200 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-1">{col.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                {col.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-black/[0.04]">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-sm font-bold text-slate-700">{col.leadCount}</span>
                  <span className="text-xs font-medium text-slate-400">Leads</span>
                </div>
                <button
                  onClick={() => onOpenCollection(col.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[13px] font-bold text-slate-700 hover:bg-blue-500 hover:text-white transition-all"
                >
                  View
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
