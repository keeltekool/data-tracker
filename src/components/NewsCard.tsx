"use client";

import { NewsItem } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  item: NewsItem;
  isRead: boolean;
  onRead: (id: string) => void;
}

export function NewsCard({ item, isRead, onRead }: NewsCardProps) {
  const handleClick = () => {
    onRead(item.id);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });

  return (
    <article
      onClick={handleClick}
      className={`group cursor-pointer p-4 sm:p-5 rounded-xl border transition-all hover:shadow-md ${
        isRead
          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600"
      }`}
    >
      <div className="flex gap-4">
        {item.thumbnail && (
          <div className="flex-shrink-0">
            <img
              src={item.thumbnail}
              alt=""
              className="w-24 h-24 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
              isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-50"
            }`}
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="truncate">{item.source}</span>
            <span>·</span>
            <span className="flex-shrink-0">{timeAgo}</span>
          </div>
        </div>
        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </article>
  );
}
