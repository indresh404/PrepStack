import React from "react";

import Skeleton from "../ui/Skeleton";

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-8 w-20 mb-3" />
        <Skeleton className="h-3 w-28" />
      </div>

      <Skeleton className="w-14 h-14 rounded-2xl" />
    </div>
  </div>
);

const PendingItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
    <Skeleton className="w-10 h-10 rounded-xl" />

    <div className="flex-1">
      <Skeleton className="h-3 w-40 mb-2" />
      <Skeleton className="h-2 w-28" />
    </div>

    <Skeleton className="w-16 h-7 rounded-lg" />
  </div>
);

const NoteCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
    <div className="flex items-start justify-between mb-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>

      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>

    <Skeleton className="h-4 w-3/4 mb-3" />

    <div className="space-y-2 mb-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>

    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-9 h-9 rounded-xl" />

      <div className="flex-1">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
      <div className="flex gap-3">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

const TopContributorSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
    <Skeleton className="w-10 h-10 rounded-xl" />

    <div className="flex-1">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-2 w-16" />
    </div>
  </div>
);

const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] animate-fadeIn">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <Skeleton className="h-5 w-40 mb-5" />

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <PendingItemSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <Skeleton className="h-10 flex-1 min-w-[200px] rounded-xl" />

            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-32 rounded-xl"
              />
            ))}
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <Skeleton className="h-5 w-40 mb-5" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <TopContributorSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardSkeleton;