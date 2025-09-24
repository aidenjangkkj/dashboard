// src/components/common/Portal.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const container = useMemo(() => {
    if (typeof window === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("data-portal-root", "1");
    return el;
  }, []);
  useEffect(() => {
    if (!container) return;
    document.body.appendChild(container);
    setMounted(true);
    return () => {
      container.remove();
    };
  }, [container]);
  if (!mounted || !container) return null;
  return createPortal(children, container);
}
