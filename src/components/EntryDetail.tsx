import { useState } from "react";
import { VaultEntry } from "../types";
import {
  ArrowLeft, Copy, Eye, EyeOff, Star, Trash2, Edit, Globe, User, Key, FileText, Tag,
} from "lucide-react";

interface Props {
  entry: VaultEntry;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function EntryDetail({ entry, onEdit, onDelete, onBack }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={onEdit}
          >
            <Edit size={16} /> Edit
          </button>
          <button
            className="btn-danger flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-100">{entry.title}</h2>
          {entry.favorite && (
            <Star size={20} className="text-amber-400 fill-amber-400" />
          )}
        </div>

        {entry.username && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <User size={12} /> Username
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-sm">
                {entry.username}
              </code>
              <button
                className="btn-secondary px-3 py-2"
                onClick={() => copyToClipboard(entry.username, "username")}
              >
                {copiedField === "username" ? "Copied!" : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Key size={12} /> Password
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-sm">
              {showPassword ? entry.password : "•".repeat(entry.password.length)}
            </code>
            <button
              className="btn-secondary px-3 py-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              className="btn-secondary px-3 py-2"
              onClick={() => copyToClipboard(entry.password, "password")}
            >
              {copiedField === "password" ? "Copied!" : <Copy size={16} />}
            </button>
          </div>
        </div>

        {entry.url && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Globe size={12} /> URL
            </label>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-vault-400 hover:text-vault-300 text-sm underline"
            >
              {entry.url}
            </a>
          </div>
        )}

        {entry.notes && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <FileText size={12} /> Notes
            </label>
            <p className="text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 whitespace-pre-wrap">
              {entry.notes}
            </p>
          </div>
        )}

        {entry.category && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Category
            </label>
            <span className="text-sm px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
              {entry.category}
            </span>
          </div>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Tag size={12} /> Tags
            </label>
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          <p>Created: {formatDate(entry.createdAt)}</p>
          <p>Modified: {formatDate(entry.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
