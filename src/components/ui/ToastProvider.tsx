// src/components/ui/ToastProvider.tsx  ← 교체
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Toast from "./Toast";

type ToastOptions = { duration?: number; redirectTo?: string };

type ToastCtx = {
  showToast: (message: ReactNode, opts?: ToastOptions) => void;
  clearToast: () => void;
};

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ReactNode | null>(null);
  const [duration, setDuration] = useState<number | undefined>(3000);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const showToast = (message: ReactNode, opts?: ToastOptions) => {
    setToast(message);
    setDuration(opts?.duration ?? 3000);
    setRedirectTo(opts?.redirectTo);
  };

  const clearToast = () => {
    setToast(null);
    setRedirectTo(undefined);
  };

  return (
    <ToastContext.Provider value={{ showToast, clearToast }}>
      {children}
      {toast && (
        <Toast
          message={toast}
          onClose={clearToast}
          duration={duration}
          redirectTo={redirectTo}
        />
      )}
    </ToastContext.Provider>
  );
}
