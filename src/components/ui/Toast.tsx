// src/components/ui/Toast.tsx
"use client";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function Toast({
  message,
  onClose,
  duration = 3000,
  redirectTo,
}: {
  message: ReactNode;
  onClose: () => void;
  duration?: number;
  redirectTo?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  const handleClose = () => {
    onClose();
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-neutral-900 text-white px-6 py-4 shadow-2xl max-w-md w-full mx-4">
        {/* 메시지 */}
        <div className="text-base font-medium text-center w-full">{message}</div>

        {/* 버튼 영역 (세로 배치) */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleClose}
            className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
