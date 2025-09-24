// src/components/ui/Toast.tsx  ← 교체(스타일만 정리)
"use client";
import { useEffect } from "react";

export default function Toast({
  message,
  onClose,
  duration = 3000,
}: {
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="rounded-lg bg-red-500 text-white px-4 py-2 shadow-lg">
        {message}
      </div>
    </div>
  );
}
