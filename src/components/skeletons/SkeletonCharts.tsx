"use client";
import Skeleton from "@/components/ui/Skeleton";

export function ChartSkeleton({ title = "" }: { title?: string }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      {title ? <div className="mb-2 text-sm text-neutral-500">{title}</div> : null}
      <Skeleton className="h-72 w-full" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export function TwoChartsSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 my-5">
      <ChartSkeleton title="소스별 누적 막대" />
      <ChartSkeleton title="소스별 비중" />
    </div>
  );
}

export function TopNBarSkeleton() {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function TargetVsActualSkeleton() {
  return <ChartSkeleton title="목표 대비 추이" />;
}
