"use client";

import Spinner from "./Spinner";

export default function Skeleton({
  className,
  withSpinner = false,
}: {
  className?: string;
  withSpinner?: boolean;
}) {
  return (
    <div
      className={`relative animate-pulse rounded-md bg-neutral-200 ${className ?? ""}`}
    >
      {withSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}
