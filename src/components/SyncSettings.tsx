import { useState } from "react";
import { SyncManager } from "../sync";
import { Vault } from "../vault";
import { X, Cloud, CloudOff, RefreshCw, Upload, Download, AlertCircle } from "lucide-react";

interface Props {
  syncManager: SyncManager;
  vault: Vault;
  onClose: () => void;
  onSynced: () => void;
}

export function SyncSettings({ syncManager, vault, onClose, onSynced }: Props) {
  const [serverUrl, setServerUrl] = useState(syncManager.getConfig()?.serverUrl || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = syncManager.isConfigured();
  const config = syncManager.getConfig();

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await syncManager.configure(serverUrl);
      if (mode === "register") {
        await syncManager.register(email, password);
      } else {
        await syncManager.login(email, password);
      }
      onSynced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync setup failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    setLoading(true);
    setError("");
    try {
      const encrypted = await vault.exportEncrypted();
      const vaultData = JSON.parse(encrypted);
      await syncManager.pushVault(vaultData);
      onSynced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Push failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    setLoading(true);
    setError("");
    try {
      const pulled = await syncManager.pullVault();
      if (pulled) {
        await vault.importEncrypted(JSON.stringify(pulled));
        onSynced();
      } else {
        setError("No vault found on server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pull failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await syncManager.clearConfig();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {configured ? <Cloud size={20} /> : <CloudOff size={20} />}
            Sync Settings
          </h2>
          <button className="btn-secondary px-2 py-1" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {configured ? (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-3 text-sm">
              <p className="text-slate-300"><span className="text-slate-500">Server:</span> {config?.serverUrl}</p>
              <p className="text-slate-300"><span className="text-slate-500">Device ID:</span> {config?.deviceId?.slice(0, 8)}...</p>
              <p className="text-slate-300"><span className="text-slate-500">Auto-sync:</span> {config?.autoSync ? "Enabled" : "Disabled"}</p>
            </div>

            <div className="flex gap-2">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handlePush} disabled={loading}>
                <Upload size={16} /> Push
              </button>
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={handlePull} disabled={loading}>
                <Download size={16} /> Pull
              </button>
            </div>

            {loading && (
              <p className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin" /> Syncing...
              </p>
            )}

            <button className="btn-danger w-full" onClick={handleDisconnect}>
              Disconnect Sync
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfigure} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Server URL</label>
              <input
                type="url"
                className="input-field"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://your-sync-server.com"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === "login" ? "bg-vault-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === "register" ? "bg-vault-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Connecting..." : mode === "register" ? "Register & Connect" : "Login & Connect"}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Your vault is encrypted before syncing. The server never sees your plaintext data.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
