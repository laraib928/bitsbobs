import React from 'react';

export function AdminSkeleton({ title = 'Loading...' }: { title?: string }) {
  return (
    <div className="p-7 sm:p-8 flex flex-col gap-6 max-w-[1320px] animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-40 bg-slate-200 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-line rounded-[16px] p-5 flex flex-col justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-line rounded-[16px] p-6 flex flex-col gap-4">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="flex flex-col gap-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full flex flex-col gap-2.5 animate-pulse py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 w-full bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}

