// components/admin-v2/primitives/AdminFilterBar.tsx
// Composable filter bar with search and status chips

import React from 'react';
import { Search, X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface AdminFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  children?: React.ReactNode; // Extra controls
}

export default function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filters,
  activeFilter = 'all',
  onFilterChange,
  children,
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-8 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all font-medium outline-none"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 admin-scrollbar-thin">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange?.(f.id)}
              className={`admin-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className={`text-[10px] font-bold ${activeFilter === f.id ? 'text-white/80' : 'text-slate-400'}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Extra controls */}
      {children}
    </div>
  );
}
