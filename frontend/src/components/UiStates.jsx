import React from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";

export const cardSurface =
  "rounded-lg border border-white/10 bg-white/[0.075] shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl";

export const panelSurface =
  "rounded-lg border border-white/10 bg-slate-950/45 shadow-xl shadow-black/20 backdrop-blur-xl";

export const premiumButton =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60";

export const SkeletonBlock = ({ className = "" }) => (
  <div
    className={`animate-shimmer rounded-lg bg-gradient-to-r from-white/[0.05] via-white/[0.14] to-white/[0.05] bg-[length:240%_100%] ${className}`}
    aria-hidden="true"
  />
);

export const DashboardSkeleton = ({ cards = 4, rows = 3 }) => (
  <div className="grid gap-5" role="status" aria-live="polite">
    <span className="sr-only">Loading content</span>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className={`${cardSurface} p-5`}>
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-5 h-9 w-20" />
          <SkeletonBlock className="mt-5 h-2 w-full" />
        </div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className={`${cardSurface} p-5`}>
        <SkeletonBlock className="h-5 w-48" />
        <SkeletonBlock className="mt-4 h-48 w-full" />
      </div>
    ))}
  </div>
);

export const InlineLoader = ({ label = "Loading..." }) => (
  <div className={`${cardSurface} grid min-h-48 place-items-center p-8`} role="status" aria-live="polite">
    <div className="text-center">
      <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-cyan-200" />
      <p className="text-sm font-bold text-slate-300">{label}</p>
    </div>
  </div>
);

export const ErrorState = ({ title = "Something went wrong", message, onRetry }) => (
  <div className={`${cardSurface} p-6 text-slate-200`} role="alert">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-rose-400/15 text-rose-100">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">{title}</h2>
          {message && <p className="mt-1 text-sm leading-6 text-slate-300">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`${premiumButton} border border-white/10 bg-white/10 text-white hover:bg-white/15`}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  </div>
);

export const EmptyState = ({
  title = "Nothing here yet",
  message = "Once activity appears, this area will fill in automatically.",
  action = null,
}) => (
  <div className={`${cardSurface} grid min-h-56 place-items-center p-8 text-center`}>
    <div className="max-w-md">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-lg shadow-cyan-950/20">
        <Inbox size={26} />
      </div>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  </div>
);
