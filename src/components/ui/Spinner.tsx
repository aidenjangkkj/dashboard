// src/components/ui/Spinner.tsx  ← 교체
export default function Spinner() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/50 backdrop-blur-sm">
      <svg className="animate-spin h-10 w-10 text-neutral-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" role="status" aria-label="Loading">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>
  );
}
