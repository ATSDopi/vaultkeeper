import { useState } from "react";
import { VaultEntry } from "../types";
import { generatePassword, generatePassphrase, PasswordOptions, DEFAULT_OPTIONS, calculateEntropy, getStrengthLabel } from "../passwordGenerator";
import { Eye, EyeOff, RefreshCw, Wand2, Save, X } from "lucide-react";

interface Props {
  entry: VaultEntry | null;
  onSave: (data: Omit<VaultEntry, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function EntryForm({ entry, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(entry?.title || "");
  const [username, setUsername] = useState(entry?.username || "");
  const [password, setPassword] = useState(entry?.password || "");
  const [url, setUrl] = useState(entry?.url || "");
  const [notes, setNotes] = useState(entry?.notes || "");
  const [category, setCategory] = useState(entry?.category || "");
  const [tags, setTags] = useState((entry?.tags || []).join(", "));
  const [favorite, setFavorite] = useState(entry?.favorite || false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genOptions, setGenOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [passphraseMode, setPassphraseMode] = useState(false);

  const entropy = calculateEntropy(password);
  const strength = getStrengthLabel(entropy);

  const handleGenerate = () => {
    if (passphraseMode) {
      setPassword(generatePassphrase(4, "-", true));
    } else {
      setPassword(generatePassword(genOptions));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      username,
      password,
      url: url || undefined,
      notes: notes || undefined,
      category: category || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      favorite,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-100">
          {entry ? "Edit Entry" : "New Entry"}
        </h2>
        <button className="btn-secondary flex items-center gap-2" onClick={onCancel}>
          <X size={16} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
          <input
            type="text"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. GitHub, Gmail, Bank"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Username / Email</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-300">Password *</label>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-xs"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-xs flex items-center gap-1"
                onClick={() => setShowGenerator(!showGenerator)}
              >
                <Wand2 size={14} /> Generate
              </button>
            </div>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className="input-field font-mono"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <div className="mt-2">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${strength.percentage}%`, backgroundColor: strength.color }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: strength.color }}>
                {strength.label} · {entropy} bits
              </p>
            </div>
          )}
        </div>

        {showGenerator && (
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Password Generator</span>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={passphraseMode}
                  onChange={(e) => setPassphraseMode(e.target.checked)}
                />
                Passphrase mode
              </label>
            </div>

            {!passphraseMode && (
              <>
                <div>
                  <label className="text-xs text-slate-400">Length: {genOptions.length}</label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={genOptions.length}
                    onChange={(e) => setGenOptions({ ...genOptions, length: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={genOptions.lowercase}
                      onChange={(e) => setGenOptions({ ...genOptions, lowercase: e.target.checked })}
                    />
                    Lowercase
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={genOptions.uppercase}
                      onChange={(e) => setGenOptions({ ...genOptions, uppercase: e.target.checked })}
                    />
                    Uppercase
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={genOptions.numbers}
                      onChange={(e) => setGenOptions({ ...genOptions, numbers: e.target.checked })}
                    />
                    Numbers
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={genOptions.symbols}
                      onChange={(e) => setGenOptions({ ...genOptions, symbols: e.target.checked })}
                    />
                    Symbols
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={genOptions.excludeAmbiguous}
                      onChange={(e) => setGenOptions({ ...genOptions, excludeAmbiguous: e.target.checked })}
                    />
                    Exclude ambiguous
                  </label>
                </div>
              </>
            )}

            <button
              type="button"
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleGenerate}
            >
              <RefreshCw size={16} /> Generate New Password
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
          <input
            type="url"
            className="input-field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
          <textarea
            className="input-field min-h-[80px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
            <input
              type="text"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Social, Work, Finance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="personal, important"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
          />
          Mark as favorite
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save size={16} /> {entry ? "Update Entry" : "Save Entry"}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
