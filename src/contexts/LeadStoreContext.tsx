import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Closed';

export interface Lead {
  id: string;
  title: string;
  status: LeadStatus;
  savedAt: string;
  collectionId?: string;
  data: any;
}

export interface ScrapeJob {
  id: string;
  query: string;
  location: string;
  timestamp: string;
  resultsCount: number;
  datasetId: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  leadCount: number;
  createdAt: string;
}

interface LeadStoreContextType {
  jobs: ScrapeJob[];
  collections: Collection[];
  leads: Lead[];
  saveJob: (job: Omit<ScrapeJob, 'id' | 'timestamp'>) => void;
  deleteJob: (id: string) => void;
  createCollection: (name: string, description?: string) => string;
  deleteCollection: (id: string) => void;
  addLeadsToCollection: (collectionId: string, rawLeads: any[]) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  deleteLead: (leadId: string) => void;
}

const LeadStoreContext = createContext<LeadStoreContextType | undefined>(undefined);

export const LeadStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const storedJobs = localStorage.getItem('leadminer_jobs');
    const storedCols = localStorage.getItem('leadminer_collections');
    const storedLeads = localStorage.getItem('leadminer_leads');

    if (storedJobs) setJobs(JSON.parse(storedJobs));
    if (storedCols) setCollections(JSON.parse(storedCols));
    if (storedLeads) setLeads(JSON.parse(storedLeads));
    
    setIsInitialized(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('leadminer_jobs', JSON.stringify(jobs));
    localStorage.setItem('leadminer_collections', JSON.stringify(collections));
    localStorage.setItem('leadminer_leads', JSON.stringify(leads));
  }, [jobs, collections, leads, isInitialized]);

  const saveJob = (job: Omit<ScrapeJob, 'id' | 'timestamp'>) => {
    const newJob: ScrapeJob = {
      ...job,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setJobs(prev => [newJob, ...prev].slice(0, 50)); // Keep last 50 runs
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const createCollection = (name: string, description?: string) => {
    const id = crypto.randomUUID();
    const newCol: Collection = {
      id,
      name,
      description,
      leadCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCol]);
    return id;
  };

  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    setLeads(prev => prev.filter(l => l.collectionId !== id));
  };

  const addLeadsToCollection = (collectionId: string, rawLeads: any[]) => {
    const newLeads: Lead[] = rawLeads.map(l => ({
      id: crypto.randomUUID(),
      title: l.title || 'Unknown Business',
      status: 'New',
      savedAt: new Date().toISOString(),
      collectionId,
      data: l,
    }));

    setLeads(prev => [...prev, ...newLeads]);
    
    setCollections(prev => prev.map(c => 
      c.id === collectionId 
        ? { ...c, leadCount: c.leadCount + newLeads.length }
        : c
    ));
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const deleteLead = (leadId: string) => {
    const leadToDelete = leads.find(l => l.id === leadId);
    if (!leadToDelete) return;

    setLeads(prev => prev.filter(l => l.id !== leadId));
    setCollections(prev => prev.map(c => 
      c.id === leadToDelete.collectionId 
        ? { ...c, leadCount: Math.max(0, c.leadCount - 1) }
        : c
    ));
  };

  return (
    <LeadStoreContext.Provider value={{ 
      jobs, collections, leads, 
      saveJob, deleteJob, 
      createCollection, deleteCollection, 
      addLeadsToCollection, updateLeadStatus, deleteLead 
    }}>
      {children}
    </LeadStoreContext.Provider>
  );
};

export const useLeadStore = () => {
  const context = useContext(LeadStoreContext);
  if (context === undefined) {
    throw new Error('useLeadStore must be used within a LeadStoreProvider');
  }
  return context;
};
