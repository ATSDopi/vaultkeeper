import { Vault } from "../vault";
import { FilterOptions, SortField } from "../types";
import { Lock, Star, RefreshCw, Cloud, CloudOff, Folder, Clock, Hash } from "lucide-react";

interface Props {
  vault: Vault;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onLock: () => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSync: number | null;
  syncConfigured: boolean;
  onOpenSyncSettings: () => void;
}

export function Sidebar({
  vault,
  filters,
  onFilterChange,
  onLock,
  onSync,
  isSyncing,
  lastSync,
  syncConfigured,
  onOpenSyncSettings,
}: Props) {
  const categories = vault.getCategories();
  const tags = vault.getAllTags();
  const favoritesCount = vault.allEntries.filter((e) => e.favorite).length;

  const formatLastSync = (ts: number | null): string => {
    if (!ts) return "Never";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vault-600 flex items-center justify-center">
            <Lock size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-100">VaultKeeper</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Filter
          </h3>
          <div className="space-y-1">
            <button
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !filters.category && !filters.favoritesOnly
                  ? "bg-vault-600/20 text-vault-300"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
              onClick={() => onFilterChange({ ...filters, category: null, favoritesOnly: false })}
            >
              All Entries ({vault.entryCount})
            </button>
            <button
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                filters.favoritesOnly
                  ? "bg-vault-600/20 text-vault-300"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
              onClick={() => onFilterChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
            >
              <Star size={14} /> Favorites ({favoritesCount})
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    filters.category === cat
                      ? "bg-vault-600/20 text-vault-300"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                  onClick={() =>
                    onFilterChange({ ...filters, category: filters.category === cat ? null : cat })
                  }
                >
                  <Folder size={14} /> {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    filters.tags.includes(tag)
                      ? "bg-vault-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                  onClick={() => {
                    const newTags = filters.tags.includes(tag)
                      ? filters.tags.filter((t) => t !== tag)
                      : [...filters.tags, tag];
                    onFilterChange({ ...filters, tags: newTags });
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Sort By
          </h3>
          <select
            className="input-field text-sm"
            value={filters.sortField}
            onChange={(e) => onFilterChange({ ...filters, sortField: e.target.value as SortField })}
          >
            <option value="updatedAt">Last Modified</option>
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
          </select>
          <button
            className="btn-secondary w-full mt-2 text-sm flex items-center justify-center gap-1"
            onClick={() =>
              onFilterChange({
                ...filters,
                sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
              })
            }
          >
            {filters.sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          className="w-full text-left text-sm text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-colors"
          onClick={onOpenSyncSettings}
        >
          {syncConfigured ? <Cloud size={16} /> : <CloudOff size={16} />}
          <div className="flex-1">
            <div>{syncConfigured ? "Sync Configured" : "Sync Not Set Up"}</div>
            <div className="text-xs text-slate-500">Last: {formatLastSync(lastSync)}</div>
          </div>
        </button>
        <button
          className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
          onClick={onSync}
          disabled={isSyncing}
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
          Sync Now
        </button>
        <button
          className="btn-danger w-full text-sm flex items-center justify-center gap-2"
          onClick={onLock}
        >
          <Lock size={14} /> Lock Vault
        </button>
      </div>
    </aside>
  );
}
