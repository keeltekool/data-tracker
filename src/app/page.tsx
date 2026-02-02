"use client";

import { useState, useEffect, useCallback } from "react";
import { Topic, NewsItem, RedditPost } from "@/types";
import { useLocalStorage, useReadStates, useVault } from "@/hooks/useLocalStorage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TopicBar } from "@/components/TopicBar";
import { NewsCard } from "@/components/NewsCard";
import { RedditCard } from "@/components/RedditCard";
import { VaultCard } from "@/components/VaultCard";
import { Spinner } from "@/components/Spinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";

type Tab = "news" | "reddit" | "vault";
type TimeFilter = 2 | 6 | 24 | 48;

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useLocalStorage<number | null>(
    "data-tracker-selected-topic",
    null
  );
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const [timeFilter, setTimeFilter] = useLocalStorage<TimeFilter>(
    "data-tracker-time-filter",
    24
  );
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const { markAsRead, isRead } = useReadStates();
  const { vaultItems, saveToVault, removeFromVault, isInVault } = useVault();

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch data when selected topic or time filter changes
  useEffect(() => {
    if (selectedTopic?.keyword) {
      fetchData(selectedTopic.keyword, timeFilter);
    }
  }, [selectedTopic?.keyword, timeFilter]);

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const res = await fetch("/api/topics");
      if (!res.ok) throw new Error("Failed to fetch topics");
      const data = await res.json();
      const topicsList = data.topics || [];
      setTopics(topicsList);

      // Auto-select first topic if none selected or selected doesn't exist
      if (topicsList.length > 0 && (!selectedTopicId || !topicsList.find((t: Topic) => t.id === selectedTopicId))) {
        setSelectedTopicId(topicsList[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchData = useCallback(async (keyword: string, hours: number = 24) => {
    setIsLoading(true);
    setError(null);

    try {
      const [newsRes, redditRes] = await Promise.all([
        fetch(`/api/news?topic=${encodeURIComponent(keyword)}&hours=${hours}`),
        fetch(`/api/reddit?topic=${encodeURIComponent(keyword)}&hours=${hours}`),
      ]);

      const newsData = await newsRes.json();
      const redditData = await redditRes.json();

      if (newsData.error && redditData.error) {
        setError("Failed to fetch both news and Reddit data. Please try again.");
      } else {
        setNewsItems(newsData.items || []);
        setRedditPosts(redditData.items || []);

        if (newsData.error) {
          console.error("News fetch error:", newsData.error);
        }
        if (redditData.error) {
          console.error("Reddit fetch error:", redditData.error);
        }
      }
    } catch (err) {
      setError("Failed to fetch data. Please check your connection and try again.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    if (selectedTopic) {
      fetchData(selectedTopic.keyword, timeFilter);
    }
  };

  const handleAddTopic = async (keyword: string) => {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add topic");
      }

      const newTopic = data.topic;
      setTopics((prev) => [...prev, newTopic]);
      setSelectedTopicId(newTopic.id);
    } catch (err) {
      console.error("Failed to add topic:", err);
      throw err;
    }
  };

  const handleEditTopic = async (id: number, keyword: string) => {
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update topic");

      const updated = data.topic;
      setTopics((prev) => prev.map((t) => (t.id === id ? updated : t)));

      // Refresh data for the updated topic
      if (selectedTopicId === id) {
        fetchData(keyword);
      }
    } catch (err) {
      console.error("Failed to update topic:", err);
      throw err;
    }
  };

  const handleDeleteTopic = async (id: number) => {
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete topic");

      setTopics((prev) => {
        const remaining = prev.filter((t) => t.id !== id);
        // If deleting selected topic, select first remaining
        if (selectedTopicId === id && remaining.length > 0) {
          setSelectedTopicId(remaining[0].id);
        } else if (remaining.length === 0) {
          setSelectedTopicId(null);
        }
        return remaining;
      });
    } catch (err) {
      console.error("Failed to delete topic:", err);
      throw err;
    }
  };

  const handleSelectTopic = (id: number) => {
    setSelectedTopicId(id);
  };

  // Show loading state while fetching topics
  if (topicsLoading) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Data-Tracker
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </main>
    );
  }

  // Show empty state if no topics
  if (topics.length === 0) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Data-Tracker
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <EmptyState onAddTopic={handleAddTopic} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Data-Tracker
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading || !selectedTopic}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Topic Bar */}
        <TopicBar
          topics={topics}
          selectedTopicId={selectedTopicId}
          onSelect={handleSelectTopic}
          onAdd={handleAddTopic}
          onEdit={handleEditTopic}
          onDelete={handleDeleteTopic}
        />

        {/* Selected Topic Info */}
        {selectedTopic && (
          <div className="mt-6 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing results for:{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {selectedTopic.keyword}
              </span>
            </p>
          </div>
        )}

        {/* Tabs and Time Filter */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("news")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "news"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              News
              {activeTab === "news" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reddit")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "reddit"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Reddit
              {activeTab === "reddit" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === "vault"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Vault
              {vaultItems.length > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === "vault"
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {vaultItems.length}
                </span>
              )}
              {activeTab === "vault" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400" />
              )}
            </button>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {([2, 6, 24, 48] as TimeFilter[]).map((hours) => (
              <button
                key={hours}
                onClick={() => setTimeFilter(hours)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  timeFilter === hours
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRefresh} />
        ) : (
          <div className="space-y-3">
            {/* News Tab Content */}
            {activeTab === "news" && newsItems.length > 0 && newsItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                isRead={isRead(item.id)}
                onRead={markAsRead}
                isInVault={isInVault(item.id)}
                onSaveToVault={() => saveToVault({
                  id: item.id,
                  type: "news",
                  title: item.title,
                  source: item.source,
                  url: item.url,
                  publishedAt: item.publishedAt,
                })}
              />
            ))}
            {activeTab === "news" && newsItems.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No news found for &quot;{selectedTopic?.keyword}&quot;</p>
                <p className="text-sm mt-2">Try a different search term or check back later.</p>
              </div>
            )}

            {/* Reddit Tab Content */}
            {activeTab === "reddit" && redditPosts.length > 0 && redditPosts.map((item) => (
              <RedditCard
                key={item.id}
                item={item}
                isRead={isRead(item.id)}
                onRead={markAsRead}
                isInVault={isInVault(item.id)}
                onSaveToVault={() => saveToVault({
                  id: item.id,
                  type: "reddit",
                  title: item.title,
                  source: item.subreddit,
                  url: item.url,
                  publishedAt: item.createdAt,
                })}
              />
            ))}
            {activeTab === "reddit" && redditPosts.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No Reddit posts found for &quot;{selectedTopic?.keyword}&quot;</p>
                <p className="text-sm mt-2">Try a different search term or check back later.</p>
              </div>
            )}

            {/* Vault Tab Content */}
            {activeTab === "vault" && vaultItems.length > 0 && vaultItems.map((item) => (
              <VaultCard
                key={item.id}
                item={item}
                onRemove={() => removeFromVault(item.id)}
              />
            ))}
            {activeTab === "vault" && vaultItems.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Your Vault is empty</p>
                <p className="text-sm mt-2">Save articles from News or Reddit tabs by clicking the bookmark icon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
