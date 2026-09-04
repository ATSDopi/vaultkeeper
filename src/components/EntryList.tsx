import { VaultEntry } from "../types";
import { Star, Globe, User, Folder, Clock } from "lucide-react";

interface Props {
  entries: VaultEntry[];
  onSelect: (entry: VaultEntry) => void;
}

function formatDate(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getInitials(title: string): string {
  return title.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-vault-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600",
  "bg-cyan-600", "bg-violet-600", "bg-orange-600", "bg-teal-600",
];

function getColorForId(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function EntryList({ entries, onSelect }: Props) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <Folder size={28} />
        </div>
        <p className="text-lg font-medium">No entries found</p>
        <p className="text-sm mt-1">Click "Add Entry" to create your first password entry</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <button
          key={entry.id}
          onClick={() => onSelect(entry)}
          className="card text-left hover:border-vault-600 transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${getColorForId(entry.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
            >
              {getInitials(entry.title)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-medium text-slate-100 truncate group-hover:text-vault-300 transition-colors">
                  {entry.title}
                </h3>
                {entry.favorite && <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />}
              </div>
              {entry.username && (
                <p className="text-sm text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <User size={12} /> {entry.username}
                </p>
              )}
              {entry.url && (
                <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Globe size={12} /> {getDomain(entry.url)}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {entry.category && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {entry.category}
                  </span>
                )}
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={10} /> {formatDate(entry.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
