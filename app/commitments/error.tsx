"use client";

import { useEffect } from "react";

export default function CommitmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-black text-white">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <pre className="text-xs text-red-400 bg-white/5 rounded-xl p-4 w-full overflow-auto whitespace-pre-wrap">
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        className="rounded-full bg-white/10 px-6 py-2 text-sm"
      >
        Try again
      </button>
    </div>
  );
}