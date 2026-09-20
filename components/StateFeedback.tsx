"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Inbox, Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading data...",
  className = "py-12",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${className}`}
    >
      <Loader2 className="w-7 h-7 animate-spin text-[#006a61]" />
      <span className="text-sm font-medium text-slate-600 animate-pulse">
        {message}
      </span>
    </div>
  );
}

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Unable to load data. Please try again.",
  onRetry,
  className = "py-8 px-6",
}: ErrorStateProps) {
  return (
    <div
      className={`bg-red-50/80 border border-red-200/80 rounded-lg p-6 flex flex-col items-center text-center gap-3 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-red-900">Request Error</h4>
        <p className="text-xs text-red-700 mt-1 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 text-xs font-medium text-red-800 bg-white border border-red-300 rounded shadow-xs hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No data available",
  message = "There are currently no records to display.",
  actionLabel,
  onAction,
  icon,
  className = "py-12",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-slate-50/60 border border-dashed border-slate-200 rounded-lg ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="mt-4 px-3.5 py-1.5 text-xs font-medium text-white bg-[#002045] hover:bg-[#1a365d] rounded shadow-xs transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
