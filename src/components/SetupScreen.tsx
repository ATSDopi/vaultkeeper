import { useState } from "react";
import { Shield, AlertCircle, Check } from "lucide-react";
import { calculateEntropy, getStrengthLabel } from "../passwordGenerator";

interface Props {
  onSetup: (password: string) => Promise<void>;
}

export function SetupScreen({ onSetup }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const entropy = calculateEntropy(password);
  const strength = getStrengthLabel(entropy);
  const passwordsMatch = password === confirm && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 12) {
      setError("Master password must be at least 12 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (entropy < 60) {
      setError("Password is too weak. Use a longer or more complex password.");
      return;
    }

    setLoading(true);
    await onSetup(password);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-vault-600 flex items-center justify-center mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Your Vault</h1>
          <p className="text-slate-400 mt-1">Choose a strong master password</p>
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
              placeholder="At least 12 characters"
              autoFocus
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
                  {strength.label} · {entropy} bits of entropy
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
            {confirm && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                {passwordsMatch ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <Check size={14} /> Passwords match
                  </span>
                ) : (
                  <span className="text-red-400">Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-1">⚠️ Important</p>
            <p>Your master password cannot be recovered. If you forget it, all data in your vault will be permanently lost.</p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !passwordsMatch}
          >
            {loading ? "Creating Vault..." : "Create Vault"}
          </button>
        </form>
      </div>
    </div>
  );
}
