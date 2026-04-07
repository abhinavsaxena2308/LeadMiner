import React, { useState } from 'react';
import {
  Download, ExternalLink, Mail, MapPin, Phone, Star,
  Building2, CheckSquare, Square, ChevronDown, ChevronUp,
  Clock, Globe, Tag, Navigation, ImageIcon, Info
} from 'lucide-react';
import { exportToCsv } from '../utils/export';

interface ResultsTableProps {
  data: any[];
}

// ── Mini star distribution bar ─────────────────────────────────────
const StarBar: React.FC<{
  dist: { oneStar: number; twoStar: number; threeStar: number; fourStar: number; fiveStar: number };
}> = ({ dist }) => {
  const total = Math.max(dist.oneStar + dist.twoStar + dist.threeStar + dist.fourStar + dist.fiveStar, 1);
  const bars = [
    { label: '5★', val: dist.fiveStar,  color: 'bg-emerald-400' },
    { label: '4★', val: dist.fourStar,  color: 'bg-lime-400' },
    { label: '3★', val: dist.threeStar, color: 'bg-yellow-400' },
    { label: '2★', val: dist.twoStar,   color: 'bg-orange-400' },
    { label: '1★', val: dist.oneStar,   color: 'bg-red-400' },
  ];
  return (
    <div className="space-y-1.5">
      {bars.map(b => (
        <div key={b.label} className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 w-5 shrink-0">{b.label}</span>
          <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <div className={`${b.color} h-full rounded-full`} style={{ width: `${(b.val / total) * 100}%` }} />
          </div>
          <span className="text-slate-500 w-5 text-right">{b.val}</span>
        </div>
      ))}
    </div>
  );
};

// ── Badge ──────────────────────────────────────────────────────────
const Badge: React.FC<{ children: React.ReactNode; variant?: 'orange' | 'red' | 'yellow' | 'slate' | 'emerald' }> = ({
  children, variant = 'slate',
}) => {
  const styles = {
    orange:  'bg-orange-500/15 text-orange-300 border-orange-500/25',
    red:     'bg-red-500/15 text-red-300 border-red-500/25',
    yellow:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    slate:   'bg-white/[0.06] text-slate-400 border-white/10',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ── Section title inside expanded row ─────────────────────────────
const DetailTitle: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
    {icon}{label}
  </p>
);

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleSelect = (i: number) => {
    const s = new Set(selected);
    s.has(i) ? s.delete(i) : s.add(i);
    setSelected(s);
  };

  const toggleAll = () =>
    setSelected(selected.size === data.length ? new Set() : new Set(data.map((_, i) => i)));

  const toggleExpand = (i: number) =>
    setExpanded(expanded === i ? null : i);

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center text-center p-12 min-h-[280px]">
        <Building2 className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-base font-semibold text-slate-300 mb-1">No leads found</h3>
        <p className="text-sm text-slate-500">Try adjusting your filters or running a new search.</p>
      </div>
    );
  }

  const mapsUrl = (lead: any) =>
    lead.url ||
    (lead.location ? `https://www.google.com/maps/search/?api=1&query=${lead.location.lat},${lead.location.lng}` :
      `https://www.google.com/maps/search/${encodeURIComponent(lead.title || '')}`);

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between gap-4 bg-white/[0.02] sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200">{data.length} Leads</h2>
          {selected.size > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {selected.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(data.filter((_, i) => selected.has(i)), 'leadminer-selected')}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export Selected
          </button>
          <button
            onClick={() => exportToCsv(data, 'leadminer-all')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 transition-all shadow-lg shadow-brand-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export All CSV
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
              <th className="p-4 w-10">
                <button onClick={toggleAll} className="text-slate-500 hover:text-brand-400 transition-colors">
                  {selected.size === data.length
                    ? <CheckSquare className="w-4 h-4 text-brand-400" />
                    : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3 hidden md:table-cell">Location</th>
              <th className="px-4 py-3 hidden sm:table-cell">Contact</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 hidden lg:table-cell">Category</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {data.map((lead, idx) => {
              const isSelected = selected.has(idx);
              const isExpanded = expanded === idx;
              const noWebsite = !lead.website;
              const url = mapsUrl(lead);

              return (
                <React.Fragment key={idx}>
                  {/* ── Main Row ── */}
                  <tr
                    className={`group transition-colors cursor-pointer
                      ${isSelected ? 'bg-brand-500/[0.07]' : 'hover:bg-white/[0.03]'}
                      ${noWebsite && !isSelected ? 'bg-orange-500/[0.04]' : ''}
                    `}
                  >
                    {/* Checkbox */}
                    <td className="p-4" onClick={e => { e.stopPropagation(); toggleSelect(idx); }}>
                      <button className="text-slate-500 hover:text-brand-400 transition-colors">
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-brand-400" />
                          : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Business */}
                    <td className="px-4 py-3.5 max-w-[200px]" onClick={() => toggleExpand(idx)}>
                      <p className="font-semibold text-slate-100 truncate leading-tight">{lead.title || 'Unknown'}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {noWebsite && <Badge variant="orange">No Website</Badge>}
                        {lead.permanentlyClosed && <Badge variant="red">Closed</Badge>}
                        {lead.temporarilyClosed && <Badge variant="yellow">Temp Closed</Badge>}
                        {lead.price && <Badge>{lead.price}</Badge>}
                      </div>
                      {lead.website && (
                        <a
                          href={lead.website} target="_blank" rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 truncate max-w-[180px]"
                          onClick={e => e.stopPropagation()}
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5 max-w-[180px] hidden md:table-cell" onClick={() => toggleExpand(idx)}>
                      <div className="flex items-start gap-2">
                        <a
                          href={url} target="_blank" rel="noopener noreferrer"
                          title="Open in Google Maps"
                          className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 hover:text-brand-300 border border-brand-500/20 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          <Navigation className="w-3 h-3" />
                        </a>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-300 truncate">{lead.address || '—'}</p>
                          {(lead.city || lead.state) && (
                            <p className="text-[11px] text-slate-500 truncate">
                              {[lead.city, lead.state, lead.countryCode].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5 hidden sm:table-cell" onClick={() => toggleExpand(idx)}>
                      <div className="space-y-1.5">
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phoneUnformatted || lead.phone}`}
                            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-brand-300 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 italic">
                            <Phone className="w-3 h-3" />No phone
                          </span>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-brand-300 transition-colors truncate max-w-[160px]"
                            onClick={e => e.stopPropagation()}
                          >
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {lead.email}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5" onClick={() => toggleExpand(idx)}>
                      {lead.totalScore ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 whitespace-nowrap">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-yellow-300">{lead.totalScore}</span>
                          <span className="text-[10px] text-slate-500">({lead.reviewsCount ?? 0})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No rating</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 hidden lg:table-cell" onClick={() => toggleExpand(idx)}>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {lead.categoryName && (
                          <span className="px-2 py-0.5 text-[11px] bg-white/[0.06] border border-white/10 rounded-md text-slate-400">
                            {lead.categoryName}
                          </span>
                        )}
                        {lead.categories?.slice(1, 2).map((c: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 text-[11px] bg-white/[0.03] border border-white/[0.06] rounded-md text-slate-500">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Expand toggle */}
                    <td className="px-4 py-3.5" onClick={() => toggleExpand(idx)}>
                      <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded Detail Row ── */}
                  {isExpanded && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                          {/* Photo */}
                          {lead.imageUrl && (
                            <div>
                              <DetailTitle icon={<ImageIcon className="w-3 h-3" />} label="Photo" />
                              <img
                                src={lead.imageUrl}
                                alt={lead.title}
                                className="w-full h-36 object-cover rounded-xl border border-white/[0.08]"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                          )}

                          {/* Full Address */}
                          <div>
                            <DetailTitle icon={<MapPin className="w-3 h-3" />} label="Full Address" />
                            <div className="space-y-0.5 text-sm">
                              {lead.street && <p className="text-slate-300">{lead.street}</p>}
                              {lead.neighborhood && <p className="text-slate-500 text-xs">{lead.neighborhood}</p>}
                              {lead.city && <p className="text-slate-300">{lead.city}{lead.state ? `, ${lead.state}` : ''}</p>}
                              {lead.postalCode && <p className="text-slate-500 text-xs">{lead.postalCode}</p>}
                              {lead.countryCode && <p className="text-slate-500 text-xs">{lead.countryCode}</p>}
                              {lead.plusCode && <p className="text-slate-600 text-[10px] mt-1 font-mono">{lead.plusCode}</p>}
                            </div>
                            <a
                              href={url} target="_blank" rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/25 text-brand-300 hover:text-brand-200 text-xs font-medium transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              Open in Google Maps
                            </a>
                          </div>

                          {/* Opening Hours */}
                          {lead.openingHours?.length > 0 && (
                            <div>
                              <DetailTitle icon={<Clock className="w-3 h-3" />} label="Opening Hours" />
                              <div className="space-y-1">
                                {lead.openingHours.map((h: { day: string; hours: string }, i: number) => (
                                  <div key={i} className="flex justify-between gap-3 text-xs">
                                    <span className="text-slate-500 font-medium w-20 shrink-0">{h.day}</span>
                                    <span className={h.hours === 'Closed' ? 'text-red-400' : 'text-slate-300'}>
                                      {h.hours}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rating dist + extras */}
                          <div className="space-y-4">
                            {lead.reviewsDistribution && (
                              <div>
                                <DetailTitle icon={<Star className="w-3 h-3" />} label="Review Breakdown" />
                                <StarBar dist={lead.reviewsDistribution} />
                              </div>
                            )}

                            <div className="space-y-1.5">
                              {lead.menu && (
                                <a href={lead.menu} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                                  <Tag className="w-3 h-3" />View Menu
                                </a>
                              )}
                              {lead.reserveTableUrl && (
                                <a href={lead.reserveTableUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                                  <ExternalLink className="w-3 h-3" />Reserve Table
                                </a>
                              )}
                            </div>

                            {lead.description && (
                              <div>
                                <DetailTitle icon={<Info className="w-3 h-3" />} label="Description" />
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{lead.description}</p>
                              </div>
                            )}

                            {lead.placeId && (
                              <p className="text-[10px] text-slate-600 font-mono break-all">ID: {lead.placeId}</p>
                            )}
                          </div>
                        </div>

                        {/* Additional Info chips */}
                        {lead.additionalInfo && Object.keys(lead.additionalInfo).length > 0 && (
                          <div className="mt-5 pt-5 border-t border-white/[0.06]">
                            <DetailTitle icon={<Info className="w-3 h-3" />} label="Additional Info" />
                            <div className="flex flex-wrap gap-x-8 gap-y-3">
                              {Object.entries(lead.additionalInfo).map(([section, items]: [string, any]) => (
                                <div key={section}>
                                  <p className="text-[10px] font-semibold text-slate-500 mb-1.5">{section}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {(items as any[]).flatMap((item: Record<string, boolean>) =>
                                      Object.entries(item)
                                        .filter(([, v]) => v === true)
                                        .map(([k]) => (
                                          <span key={k} className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] text-slate-400 text-[11px] rounded-full">
                                            {k}
                                          </span>
                                        ))
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
