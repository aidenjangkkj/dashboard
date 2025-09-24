// src/components/ui/ToastProvider.tsx
"use client";

import { useDataStore } from "@/store/useDataStore";
import Toast from "./Toast";

export default function ToastProvider() {
  const { error, clearError } = useDataStore();

  if (!error) return null;
  return <Toast message={error} onClose={clearError} />;
}
