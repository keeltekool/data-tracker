"use client";

import { RedditPost } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface RedditCardProps {
  item: RedditPost;
  isRead: boolean;
  onRead: (id: string) => void;
  isInVault?: boolean;
  onSaveToVault?: () => void;
}

export function RedditCard({ item, isRead, onRead, isInVault, onSaveToVault }: RedditCardProps) {
  const handleClick = () => {
    onRead(item.id);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveToVault?.();
  };

  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  // Format score (e.g., 1500 -> 1.5k)
  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  };

  return (
    <article
      onClick={handleClick}
      className={`group cursor-pointer p-4 sm:p-5 rounded-xl border transition-all hover:shadow-md ${
        isRead
          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-600"
      }`}
    >
      <div className="flex gap-4">
        {/* Score */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-12">
          <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {formatScore(item.score)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold line-clamp-2 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ${
              isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-50"
            }`}
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">
              {item.subreddit}
            </span>
            <span>·</span>
            <span>{item.commentsCount} comments</span>
            <span>·</span>
            <span className="flex-shrink-0">{timeAgo}</span>
          </div>
        </div>

        {/* Save & External link */}
        <div className="flex-shrink-0 self-center flex items-center gap-2">
          {onSaveToVault && (
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg transition-colors ${
                isInVault
                  ? "text-amber-500 bg-amber-50 dark:bg-amber-900/30"
                  : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 sm:invisible sm:group-hover:visible"
              }`}
              title={isInVault ? "Saved to Vault" : "Save to Vault"}
            >
              <svg className="w-5 h-5" fill={isInVault ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
