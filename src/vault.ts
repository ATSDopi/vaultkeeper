import { VaultEntry, EncryptedVault, EncryptedEntry } from "./types";
import {
  deriveKey,
  generateSalt,
  encrypt,
  decrypt,
  createVerifier,
  verifyKey,
  encryptEntry,
  decryptEntry,
  generateId,
} from "./crypto";

const VAULT_VERSION = 1;
const STORAGE_KEY = "vaultkeeper.encryptedVault";
const KEY_CACHE_TTL = 15 * 60 * 1000;

export class Vault {
  private key: CryptoKey | null = null;
  private salt: string = "";
  private verifier: string = "";
  private verifierIv: string = "";
  private entries: Map<string, VaultEntry> = new Map();
  private keyCacheTime: number = 0;
  private unlocked: boolean = false;

  get isUnlocked(): boolean {
    return this.unlocked && this.key !== null;
  }

  get entryCount(): number {
    return this.entries.size;
  }

  get allEntries(): VaultEntry[] {
    return Array.from(this.entries.values());
  }

  static async exists(): Promise<boolean> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data !== null;
  }

  static async loadFromStorage(): Promise<EncryptedVault | null> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as EncryptedVault;
  }

  async createVault(masterPassword: string): Promise<void> {
    this.salt = await generateSalt();
    this.key = await deriveKey(masterPassword, this.salt);

    const { verifier, iv } = await createVerifier(this.key);
    this.verifier = verifier;
    this.verifierIv = iv;

    this.entries.clear();
    this.unlocked = true;
    this.keyCacheTime = Date.now();

    await this.save();
  }

  async unlock(masterPassword: string): Promise<boolean> {
    const stored = await Vault.loadFromStorage();
    if (!stored) return false;

    this.salt = stored.salt;
    const key = await deriveKey(masterPassword, this.salt);

    const valid = await verifyKey(key, stored.verifier, stored.verifierIv);
    if (!valid) return false;

    this.key = key;
    this.verifier = stored.verifier;
    this.verifierIv = stored.verifierIv;
    this.keyCacheTime = Date.now();
    this.unlocked = true;

    for (const encEntry of stored.entries) {
      try {
        const { data } = await decryptEntry(this.key, encEntry);
        const entry = JSON.parse(data) as VaultEntry;
        this.entries.set(entry.id, entry);
      } catch (err) {
        console.error(`Failed to decrypt entry ${encEntry.id}:`, err);
      }
    }

    return true;
  }

  lock(): void {
    this.key = null;
    this.unlocked = false;
    this.entries.clear();
  }

  checkKeyExpiry(): void {
    if (this.unlocked && Date.now() - this.keyCacheTime > KEY_CACHE_TTL) {
      this.lock();
    }
  }

  async addEntry(entry: Omit<VaultEntry, "id" | "createdAt" | "updatedAt">): Promise<VaultEntry> {
    if (!this.isUnlocked) throw new Error("Vault is locked");

    const now = Date.now();
    const newEntry: VaultEntry = {
      ...entry,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.entries.set(newEntry.id, newEntry);
    await this.save();
    return newEntry;
  }

  async updateEntry(id: string, updates: Partial<VaultEntry>): Promise<VaultEntry | null> {
    if (!this.isUnlocked) throw new Error("Vault is locked");

    const existing = this.entries.get(id);
    if (!existing) return null;

    const updated: VaultEntry = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };

    this.entries.set(id, updated);
    await this.save();
    return updated;
  }

  async deleteEntry(id: string): Promise<boolean> {
    if (!this.isUnlocked) throw new Error("Vault is locked");

    const deleted = this.entries.delete(id);
    if (deleted) await this.save();
    return deleted;
  }

  getEntry(id: string): VaultEntry | null {
    return this.entries.get(id) || null;
  }

  search(query: string): VaultEntry[] {
    const lower = query.toLowerCase();
    return this.allEntries.filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.username.toLowerCase().includes(lower) ||
        (e.url || "").toLowerCase().includes(lower) ||
        (e.notes || "").toLowerCase().includes(lower) ||
        (e.category || "").toLowerCase().includes(lower)
    );
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    for (const entry of this.entries.values()) {
      if (entry.category) categories.add(entry.category);
    }
    return Array.from(categories).sort();
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    for (const entry of this.entries.values()) {
      if (entry.tags) entry.tags.forEach((t) => tags.add(t));
    }
    return Array.from(tags).sort();
  }

  private async save(): Promise<void> {
    if (!this.key) throw new Error("Vault is locked");

    const encryptedEntries: EncryptedEntry[] = [];

    for (const entry of this.entries.values()) {
      const data = JSON.stringify(entry);
      const encrypted = await encryptEntry(this.key, { id: entry.id, data });
      encryptedEntries.push({
        id: encrypted.id,
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext,
        updatedAt: entry.updatedAt,
      });
    }

    const vault: EncryptedVault = {
      version: VAULT_VERSION,
      salt: this.salt,
      verifier: this.verifier,
      verifierIv: this.verifierIv,
      entries: encryptedEntries,
      metadata: {
        createdAt: encryptedEntries.length > 0
          ? Math.min(...encryptedEntries.map((e) => e.updatedAt))
          : Date.now(),
        updatedAt: Date.now(),
        entryCount: encryptedEntries.length,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
  }

  async exportEncrypted(): Promise<string> {
    const stored = await Vault.loadFromStorage();
    if (!stored) throw new Error("No vault found");
    return JSON.stringify(stored, null, 2);
  }

  async importEncrypted(json: string): Promise<void> {
    const data = JSON.parse(json) as EncryptedVault;
    if (data.version !== VAULT_VERSION) {
      throw new Error(`Unsupported vault version: ${data.version}`);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
