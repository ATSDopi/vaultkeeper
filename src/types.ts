export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

export interface EncryptedEntry {
  id: string;
  iv: string;
  ciphertext: string;
  updatedAt: number;
}

export interface EncryptedVault {
  version: number;
  salt: string;
  verifier: string;
  verifierIv: string;
  entries: EncryptedEntry[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    entryCount: number;
  };
}

export interface VaultMetadata {
  version: number;
  createdAt: number;
  updatedAt: number;
  entryCount: number;
}

export interface SyncConfig {
  serverUrl: string;
  deviceId: string;
  authToken?: string;
  autoSync: boolean;
  syncInterval: number;
}

export interface UserAccount {
  id: string;
  email: string;
  authHash: string;
  salt: string;
  createdAt: number;
}

export type SortField = "title" | "updatedAt" | "createdAt" | "category";
export type SortDirection = "asc" | "desc";

export interface FilterOptions {
  search: string;
  category: string | null;
  tags: string[];
  favoritesOnly: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
}

export const DEFAULT_FILTERS: FilterOptions = {
  search: "",
  category: null,
  tags: [],
  favoritesOnly: false,
  sortField: "updatedAt",
  sortDirection: "desc",
};
