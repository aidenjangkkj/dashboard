// src/components/ui/Card.tsx  ← 교체
import clsx from "clsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  value?: string;
  className?: string;
  compact?: boolean; // 패딩 줄인 카드
}>;

export default function Card({ title, subtitle, value, className, compact, children }: Props) {
  return (
    <section
      className={clsx(
        "rounded-2xl border bg-white shadow-sm",
        "border-neutral-200",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      {(title || subtitle) && (
        <header className={clsx("mb-2", value && "mb-3")}>
          {title && <h2 className="text-base md:text-lg font-semibold">{title}</h2>}
          {subtitle && <p className="text-xs md:text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
        </header>
      )}
      {value != null && (
        <div className="text-xl md:text-2xl font-semibold tracking-tight">{value}</div>
      )}
      {children}
    </section>
  );
}
