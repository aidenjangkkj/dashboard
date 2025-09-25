"use client";
import Skeleton from "@/components/ui/Skeleton";

export function DetailHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function KpiRowSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {[0,1,2].map((i) => (
        <div key={i} className="p-4 bg-white rounded-2xl shadow-sm">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-8 w-36" />
        </div>
      ))}
    </div>
  );
}

export function ChartsGridSkeleton() {
  return (
    <>
      <div className="grid gap-6 grid-cols-1 my-5">
        <div className="p-4 bg-white rounded-2xl shadow-sm">
          <Skeleton className="h-5 w-40 mb-3" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 my-5">
        <div className="p-4 bg-white rounded-2xl shadow-sm">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-sm">
          <Skeleton className="h-5 w-28 mb-3" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </>
  );
}

export function PostsSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[2fr,1fr]">
      {/* PostList */}
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl border bg-neutral-50">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-4 w-44 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      </div>
      {/* PostEditor */}
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <Skeleton className="h-5 w-28 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** 회사 상세 스켈레톤 */
export function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <DetailHeaderSkeleton />
      <KpiRowSkeleton />
      <ChartsGridSkeleton />
      <PostsSkeleton />
    </div>
  );
}

/** 국가 상세 스켈레톤 */
export function CountryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <DetailHeaderSkeleton />
      <KpiRowSkeleton />
      <ChartsGridSkeleton />
      <PostsSkeleton />
    </div>
  );
}
