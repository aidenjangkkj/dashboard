"use client";
import Skeleton from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";

function withSpinner(children: React.ReactNode) {
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner size={24} />
      </div>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {[0, 1, 2].map((i) =>
        withSpinner(
          <div key={i} className="p-4 bg-white rounded-2xl shadow-sm">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-40" />
          </div>
        )
      )}
    </div>
  );
}

export function CountryCardsSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) =>
        withSpinner(
          <div key={i} className="p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        )
      )}
    </div>
  );
}

export function CompanyCardsSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) =>
        withSpinner(
          <div key={i} className="p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        )
      )}
    </div>
  );
}
