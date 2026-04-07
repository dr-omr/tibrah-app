// components/admin-v2/primitives/AdminLoadingSkeleton.tsx
import React from 'react';

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-stat-card">
          <div className="flex items-start justify-between mb-3">
            <div className="admin-skeleton admin-skeleton-avatar" />
            <div className="admin-skeleton" style={{ width: 48, height: 20, borderRadius: 6 }} />
          </div>
          <div className="admin-skeleton admin-skeleton-stat mb-2" />
          <div className="admin-skeleton admin-skeleton-text" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="admin-skeleton admin-skeleton-title" />
        <div className="admin-skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}><div className="admin-skeleton" style={{ width: `${50 + i * 20}px`, height: 12 }} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c}>
                    <div className="admin-skeleton admin-skeleton-text" style={{ width: `${60 + Math.sin(r + c) * 40}px` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="admin-skeleton admin-skeleton-title mb-2" />
          <div className="admin-skeleton admin-skeleton-text" style={{ width: 200 }} />
        </div>
        <div className="admin-skeleton" style={{ width: 100, height: 36, borderRadius: 10 }} />
      </div>
      <StatGridSkeleton />
      <TableSkeleton />
    </div>
  );
}
