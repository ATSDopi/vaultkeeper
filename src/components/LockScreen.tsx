import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";

interface Props {
  onUnlock: (password: string) => Promise<boolean>;
}

export function LockScreen({ onUnlock }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await onUnlock(password);
    if (!success) {
      setError("Incorrect master password");
    }
    setPassword("");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-vault-600 flex items-center justify-center mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">VaultKeeper</h1>
          <p className="text-slate-400 mt-1">Enter your master password to unlock</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Master Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !password}
          >
            {loading ? "Unlocking..." : "Unlock Vault"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Your data is encrypted with AES-256-GCM and never leaves your device unencrypted.
        </p>
      </div>
    </div>
  );
}
