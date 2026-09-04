import { useState, useEffect, useCallback } from "react";
import { Vault } from "./vault";
import { SyncManager } from "./sync";
import { VaultEntry, FilterOptions, DEFAULT_FILTERS } from "./types";
import { LockScreen } from "./components/LockScreen";
import { SetupScreen } from "./components/SetupScreen";
import { Sidebar } from "./components/Sidebar";
import { EntryList } from "./components/EntryList";
import { EntryDetail } from "./components/EntryDetail";
import { EntryForm } from "./components/EntryForm";
import { SyncSettings } from "./components/SyncSettings";
import { SearchBar } from "./components/SearchBar";
import { Key, Plus, Settings, RefreshCw, X, Lock } from "lucide-react";

type View = "list" | "detail" | "form" | "settings";
type Mode = "locked" | "setup" | "unlocked";

export default function App() {
  const [mode, setMode] = useState<Mode>("locked");
  const [vault] = useState(() => new Vault());
  const [syncManager] = useState(() => new SyncManager());
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [view, setView] = useState<View>("list");
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    Vault.exists().then((exists) => {
      if (!exists) setMode("setup");
    });
  }, []);

  useEffect(() => {
    if (syncManager.isConfigured()) {
      setLastSync(syncManager.getLastSyncTime());
    }
  }, [syncManager]);

  const refreshEntries = useCallback(() => {
    if (vault.isUnlocked) {
      setEntries(vault.allEntries);
    }
  }, [vault]);

  const handleUnlock = async (password: string) => {
    const success = await vault.unlock(password);
    if (success) {
      setMode("unlocked");
      refreshEntries();
    }
    return success;
  };

  const handleSetup = async (password: string) => {
    await vault.createVault(password);
    setMode("unlocked");
    refreshEntries();
  };

  const handleLock = () => {
    vault.lock();
    setMode("locked");
    setEntries([]);
    setSelectedEntry(null);
    setView("list");
  };

  const handleAddEntry = async (entry: Omit<VaultEntry, "id" | "createdAt" | "updatedAt">) => {
    await vault.addEntry(entry);
    refreshEntries();
    setView("list");
  };

  const handleUpdateEntry = async (id: string, updates: Partial<VaultEntry>) => {
    await vault.updateEntry(id, updates);
    refreshEntries();
    setView("list");
  };

  const handleDeleteEntry = async (id: string) => {
    await vault.deleteEntry(id);
    refreshEntries();
    setSelectedEntry(null);
    setView("list");
  };

  const handleSync = async () => {
    if (!syncManager.isConfigured()) {
      setShowSyncSettings(true);
      return;
    }
    setIsSyncing(true);
    try {
      const encrypted = await vault.exportEncrypted();
      const vaultData = JSON.parse(encrypted);
      await syncManager.pushVault(vaultData);
      setLastSync(Date.now());
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filters.favoritesOnly && !e.favorite) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.tags.length > 0 && !filters.tags.every((t) => e.tags?.includes(t))) return false;
    if (filters.search) {
      const lower = filters.search.toLowerCase();
      return (
        e.title.toLowerCase().includes(lower) ||
        e.username.toLowerCase().includes(lower) ||
        (e.url || "").toLowerCase().includes(lower) ||
        (e.notes || "").toLowerCase().includes(lower)
      );
    }
    return true;
  }).sort((a, b) => {
    const dir = filters.sortDirection === "asc" ? 1 : -1;
    return a[filters.sortField].toString().localeCompare(b[filters.sortField].toString()) * dir;
  });

  if (mode === "setup") {
    return <SetupScreen onSetup={handleSetup} />;
  }

  if (mode === "locked") {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        vault={vault}
        filters={filters}
        onFilterChange={setFilters}
        onLock={handleLock}
        onSync={handleSync}
        isSyncing={isSyncing}
        lastSync={lastSync}
        syncConfigured={syncManager.isConfigured()}
        onOpenSyncSettings={() => setShowSyncSettings(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters({ ...filters, search })}
          />
          <div className="flex items-center gap-2">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => { setEditingEntry(null); setView("form"); }}
            >
              <Plus size={18} />
              Add Entry
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
              Sync
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => setShowSyncSettings(true)}
            >
              <Settings size={18} />
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={handleLock}
            >
              <Lock size={18} />
              Lock
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {view === "list" && (
            <EntryList
              entries={filteredEntries}
              onSelect={(entry) => { setSelectedEntry(entry); setView("detail"); }}
            />
          )}
          {view === "detail" && selectedEntry && (
            <EntryDetail
              entry={selectedEntry}
              onEdit={() => { setEditingEntry(selectedEntry); setView("form"); }}
              onDelete={() => handleDeleteEntry(selectedEntry.id)}
              onBack={() => setView("list")}
            />
          )}
          {view === "form" && (
            <EntryForm
              entry={editingEntry}
              onSave={(data) => {
                if (editingEntry) {
                  handleUpdateEntry(editingEntry.id, data);
                } else {
                  handleAddEntry(data);
                }
              }}
              onCancel={() => setView("list")}
            />
          )}
        </main>
      </div>

      {showSyncSettings && (
        <SyncSettings
          syncManager={syncManager}
          vault={vault}
          onClose={() => setShowSyncSettings(false)}
          onSynced={() => { setLastSync(Date.now()); refreshEntries(); }}
        />
      )}
    </div>
  );
}
