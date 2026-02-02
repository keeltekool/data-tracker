"use client";

import { NewsItem } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  item: NewsItem;
  isRead: boolean;
  onRead: (id: string) => void;
  isInVault?: boolean;
  onSaveToVault?: () => void;
}

export function NewsCard({ item, isRead, onRead, isInVault, onSaveToVault }: NewsCardProps) {
  const handleClick = () => {
    onRead(item.id);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveToVault?.();
  };

  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true });

  // Get favicon URL for the source domain
  const getFaviconUrl = (source: string) => {
    const domain = source.toLowerCase().replace(/\s+/g, "");
    // Map common sources to their actual domains
    const domainMap: Record<string, string> = {
      "yahoofinance": "finance.yahoo.com",
      "seekingalpha": "seekingalpha.com",
      "bloomberg.com": "bloomberg.com",
      "reuters": "reuters.com",
      "cnbc": "cnbc.com",
      "forbes": "forbes.com",
      "benzinga": "benzinga.com",
      "marketwatch.com": "marketwatch.com",
      "investopedia": "investopedia.com",
      "themotleyfool": "fool.com",
      "barron's": "barrons.com",
      "businessinsider": "businessinsider.com",
      "cnn": "cnn.com",
      "wsj": "wsj.com",
      "tipranks": "tipranks.com",
      "zacksinvestmentresearch": "zacks.com",
      "barchart.com": "barchart.com",
      "theblock": "theblock.co",
      "coindesk": "coindesk.com",
      "bitcoinmagazine": "bitcoinmagazine.com",
    };
    const mappedDomain = Object.entries(domainMap).find(([key]) =>
      domain.includes(key.replace(/[^a-z0-9]/g, ""))
    )?.[1] || `${source.split(" ")[0].toLowerCase().replace(/[^a-z0-9.]/g, "")}.com`;
    return `https://www.google.com/s2/favicons?domain=${mappedDomain}&sz=64`;
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
        {/* Source favicon - always shown for visual consistency */}
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800">
          <img
            src={getFaviconUrl(item.source)}
            alt=""
            className="w-8 h-8"
            onError={(e) => {
              // Hide on error
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold line-clamp-4 sm:line-clamp-2 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ${
              isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-50"
            }`}
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="truncate font-medium text-cyan-600 dark:text-cyan-400">{item.source}</span>
            <span>·</span>
            <span className="flex-shrink-0">{timeAgo}</span>
          </div>
        </div>
        <div className="flex-shrink-0 self-center flex items-center gap-2">
          {onSaveToVault && (
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg transition-colors ${
                isInVault === true
                  ? "text-amber-500 bg-amber-50 dark:bg-amber-900/30"
                  : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 sm:invisible sm:group-hover:visible"
              }`}
              title={isInVault === true ? "Saved to Vault" : "Save to Vault"}
            >
              <svg className="w-5 h-5" fill={isInVault === true ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
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
