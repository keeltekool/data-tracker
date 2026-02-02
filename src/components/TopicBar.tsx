"use client";

import { useState } from "react";
import { Topic } from "@/types";

interface TopicBarProps {
  topics: Topic[];
  selectedTopicId: number | null;
  onSelect: (id: number) => void;
  onAdd: (keyword: string) => Promise<void>;
  onEdit: (id: number, keyword: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TopicBar({
  topics,
  selectedTopicId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: TopicBarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setError(null);
    try {
      await onAdd(inputValue.trim());
      setInputValue("");
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add topic");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setError(null);
    try {
      await onEdit(id, inputValue.trim());
      setInputValue("");
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
    }
  };

  const startEditing = (topic: Topic) => {
    setEditingId(topic.id);
    setInputValue(topic.keyword);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setInputValue("");
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this topic?")) return;
    try {
      await onDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete topic");
    }
  };

  return (
    <div className="space-y-3">
      {/* Topic chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Add button */}
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setError(null);
            }}
            disabled={topics.length >= 20}
            className="px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 border-2 border-dashed border-cyan-300 dark:border-cyan-600 rounded-full hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Topic
          </button>
        )}

        {/* Add input */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter topic..."
              autoFocus
              className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 rounded-full hover:bg-cyan-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setInputValue("");
                setError(null);
              }}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Topic chips */}
        {topics.map((topic) => (
          <div key={topic.id} className="relative group">
            {editingId === topic.id ? (
              <form onSubmit={(e) => handleEditSubmit(e, topic.id)} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                  className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-2 py-1 text-xs font-medium text-white bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => onSelect(topic.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  selectedTopicId === topic.id
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {topic.keyword}
              </button>
            )}

            {/* Edit/Delete buttons on hover */}
            {selectedTopicId === topic.id && editingId !== topic.id && (
              <div className="absolute -right-1 -top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(topic);
                  }}
                  className="p-1 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Edit"
                >
                  <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(topic.id);
                  }}
                  className="p-1 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Delete"
                >
                  <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Topic limit warning */}
      {topics.length >= 18 && topics.length < 20 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {20 - topics.length} topic{20 - topics.length === 1 ? "" : "s"} remaining
        </p>
      )}
    </div>
  );
}
