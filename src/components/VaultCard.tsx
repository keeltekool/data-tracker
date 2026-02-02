"use client";

import { VaultItem } from "@/hooks/useLocalStorage";
import { formatDistanceToNow } from "date-fns";

interface VaultCardProps {
  item: VaultItem;
  onRemove: () => void;
}

export function VaultCard({ item, onRemove }: VaultCardProps) {
  const handleClick = () => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  const savedAgo = formatDistanceToNow(new Date(item.savedAt), { addSuffix: true });
  const publishedAgo = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });

  const isNews = item.type === "news";

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer p-4 sm:p-5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 transition-all hover:shadow-md"
    >
      <div className="flex gap-4">
        {/* Type indicator */}
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800">
          {isNews ? (
            <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-2 mb-2 text-slate-900 dark:text-slate-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="font-medium text-cyan-600 dark:text-cyan-400">
              {item.source}
            </span>
            <span>·</span>
            <span>Published {publishedAgo}</span>
            <span>·</span>
            <span className="text-amber-600 dark:text-amber-400">Saved {savedAgo}</span>
          </div>
        </div>

        {/* Remove button */}
        <div className="flex-shrink-0 self-center flex items-center gap-2">
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 sm:invisible sm:group-hover:visible transition-colors"
            title="Remove from Vault"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="invisible group-hover:visible">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
