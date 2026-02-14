import React from 'react'

/* Reusable shimmer bar */
const Bone = ({ className = '' }) => (
  <div className={`bg-white/5 rounded animate-pulse ${className}`} />
)

/** Skeleton for a poster card grid (e.g. search results, recommendations). */
export const CardGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="rounded-lg overflow-hidden bg-[#141414] border border-white/5">
        <Bone className="aspect-[2/3] rounded-none" />
        <div className="p-2 space-y-1.5">
          <Bone className="h-3 w-3/4" />
          <Bone className="h-2 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

/** Skeleton for a movie / TV detail page. */
export const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
    {/* Player area */}
    <Bone className="w-full aspect-video mb-6 rounded-xl" />

    {/* Backdrop / hero */}
    <div className="flex gap-6 items-end mb-8">
      <Bone className="hidden md:block w-[160px] h-[240px] rounded-lg" />
      <div className="flex-1 space-y-3">
        <Bone className="h-8 w-2/3" />
        <Bone className="h-4 w-1/3" />
        <div className="flex gap-3">
          <Bone className="h-5 w-16 rounded-full" />
          <Bone className="h-5 w-16 rounded-full" />
          <Bone className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="space-y-4">
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-5/6" />
      <Bone className="h-4 w-3/4" />
    </div>

    {/* Cast grid */}
    <div className="mt-10 space-y-3">
      <Bone className="h-4 w-24" />
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-[#141414] rounded-lg overflow-hidden border border-white/5">
            <Bone className="w-full h-[140px] rounded-none" />
            <div className="p-2 space-y-1">
              <Bone className="h-3 w-3/4" />
              <Bone className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

/** Skeleton for a horizontal trending row. */
export const RowSkeleton = () => (
  <div className="mb-10 px-4 md:px-12">
    <Bone className="h-5 w-48 mb-3" />
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 8 }, (_, i) => (
        <Bone key={i} className="flex-shrink-0 w-[130px] md:w-[200px] aspect-[2/3] rounded-md" />
      ))}
    </div>
  </div>
)

export default { CardGridSkeleton, DetailSkeleton, RowSkeleton }
