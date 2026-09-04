import { SyncConfig, EncryptedVault } from "./types";
import { generateDeviceId } from "./crypto";

const SYNC_CONFIG_KEY = "vaultkeeper.syncConfig";
const LAST_SYNC_KEY = "vaultkeeper.lastSync";

export class SyncManager {
  private config: SyncConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    const data = localStorage.getItem(SYNC_CONFIG_KEY);
    if (data) {
      this.config = JSON.parse(data);
    }
  }

  private saveConfig(): void {
    if (this.config) {
      localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(this.config));
    }
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.serverUrl;
  }

  getConfig(): SyncConfig | null {
    return this.config;
  }

  async configure(serverUrl: string, autoSync: boolean = true): Promise<void> {
    this.config = {
      serverUrl: serverUrl.replace(/\/$/, ""),
      deviceId: this.config?.deviceId || generateDeviceId(),
      autoSync,
      syncInterval: 60000,
    };
    this.saveConfig();
  }

  async register(email: string, password: string): Promise<boolean> {
    if (!this.config) throw new Error("Sync not configured");

    const response = await fetch(`${this.config.serverUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceId: this.config.deviceId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    this.config.authToken = data.token;
    this.saveConfig();
    return true;
  }

  async login(email: string, password: string): Promise<boolean> {
    if (!this.config) throw new Error("Sync not configured");

    const response = await fetch(`${this.config.serverUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceId: this.config.deviceId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Login failed" }));
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    this.config.authToken = data.token;
    this.saveConfig();
    return true;
  }

  async pushVault(encryptedVault: EncryptedVault): Promise<boolean> {
    if (!this.config?.authToken) throw new Error("Not authenticated");

    const response = await fetch(`${this.config.serverUrl}/api/vault/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.authToken}`,
      },
      body: JSON.stringify({ vault: encryptedVault, deviceId: this.config.deviceId }),
    });

    if (response.status === 409) {
      return false;
    }
    if (!response.ok) {
      throw new Error("Push failed");
    }

    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    return true;
  }

  async pullVault(): Promise<EncryptedVault | null> {
    if (!this.config?.authToken) throw new Error("Not authenticated");

    const response = await fetch(`${this.config.serverUrl}/api/vault/pull`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.authToken}`,
      },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Pull failed");

    const data = await response.json();
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    return data.vault as EncryptedVault;
  }

  getLastSyncTime(): number | null {
    const ts = localStorage.getItem(LAST_SYNC_KEY);
    return ts ? parseInt(ts, 10) : null;
  }

  async logout(): Promise<void> {
    if (this.config) {
      this.config.authToken = undefined;
      this.saveConfig();
    }
  }

  async clearConfig(): Promise<void> {
    localStorage.removeItem(SYNC_CONFIG_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    this.config = null;
  }
}
