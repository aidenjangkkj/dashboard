import "@/app/globals.css";

// src/components/ui/Card.tsx
export default function Card({
  title,
  value,
  subtitle,
  headerRight,
  interactive,
  onClick,
  compact,
  children,
  tone = "default", // "default" | "brand" | "accent" | "warning"
}: {
  title?: string;
  value?: string | React.ReactNode;
  subtitle?: string;
  headerRight?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  compact?: boolean;
  children?: React.ReactNode;
  tone?: "default" | "brand" | "accent" | "warning";
}) {
  const toneBadge =
    tone === "brand"
      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
      : tone === "accent"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : tone === "warning"
      ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
      : "bg-neutral-50 text-neutral-600 dark:bg-white/5 dark:text-neutral-300";

  return (
    <div
      className={`card ${interactive ? "cursor-pointer card-hover" : ""} ${
        compact ? "py-3 px-4" : "p-4"
      }`}
      role={interactive ? "button" : undefined}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && (
            <div className={`inline-flex items-center gap-2 text-sm ${toneBadge} px-2 py-0.5 rounded-full`}>
              <span className="truncate">{title}</span>
            </div>
          )}
          {value && (
            <div className="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
              {value}
            </div>
          )}
          {subtitle && <div className="text-xs text-neutral-500 mt-1">{subtitle}</div>}
        </div>
        {headerRight}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

