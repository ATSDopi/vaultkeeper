# VaultKeeper

> Local-First Password Manager with End-to-End Encryption and Optional Self-Hosted Sync

[![CI](https://github.com/user/vaultkeeper/actions/workflows/ci.yml/badge.svg)](https://github.com/user/vaultkeeper/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

## Features

- **Local-first** — All data stored encrypted in your browser's localStorage
- **E2E encryption** — AES-256-GCM with PBKDF2 key derivation (600,000 iterations)
- **Zero-knowledge** — The server never sees your plaintext data or master password
- **Optional self-hosted sync** — Sync across devices with your own server
- **Password generator** — Configurable length, character sets, passphrase mode
- **Password strength meter** — Real-time entropy calculation
- **Categories & tags** — Organize entries with categories and tags
- **Favorites** — Mark frequently used entries
- **Search & filter** — Full-text search across all fields
- **Auto-lock** — Vault locks after 15 minutes of inactivity
- **Modern UI** — Dark theme with TailwindCSS, Lucide icons

## Security Architecture

```
Master Password
      │
      ▼
  PBKDF2 (600,000 iterations, SHA-256, 32-byte salt)
      │
      ▼
  AES-256-GCM Key (non-extractable)
      │
      ├──► Encrypt each vault entry (individual IV per entry)
      ├──► Create verifier token (to validate password on unlock)
      └──► Never stored, never sent to server
```

- **Key derivation**: PBKDF2 with 600,000 iterations and SHA-256
- **Encryption**: AES-256-GCM (authenticated encryption)
- **Key storage**: CryptoKey objects are non-extractable (never serialized)
- **Sync**: Only encrypted vault data is sent to the server
- **Server**: Stores encrypted blobs, never has access to plaintext

## Quick Start

### Frontend (Web App)

```bash
npm install
npm run dev
```

Open http://localhost:5174

### Sync Server (Optional)

```bash
npm run dev:server
```

Server runs on http://localhost:3001

### Docker

```bash
docker-compose up
```

## Usage

1. **Create your vault** — Choose a strong master password (min 12 chars)
2. **Add entries** — Store passwords, usernames, URLs, notes
3. **Generate passwords** — Use the built-in generator with configurable options
4. **Organize** — Use categories, tags, and favorites
5. **Sync (optional)** — Set up your sync server to sync across devices

## Project Structure

```
vaultkeeper/
├── src/
│   ├── components/
│   │   ├── LockScreen.tsx
│   │   ├── SetupScreen.tsx
│   │   ├── Sidebar.tsx
│   │   ├── EntryList.tsx
│   │   ├── EntryDetail.tsx
│   │   ├── EntryForm.tsx
│   │   ├── SyncSettings.tsx
│   │   └── SearchBar.tsx
│   ├── crypto.ts          # Web Crypto API wrapper
│   ├── vault.ts           # Vault management class
│   ├── sync.ts            # Sync client
│   ├── passwordGenerator.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/
│   ├── index.ts           # Express sync server
│   └── tsconfig.json
├── tests/
│   └── passwordGenerator.test.ts
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── package.json
```

## Development

```bash
npm install
npm run dev          # Start frontend dev server
npm run dev:server   # Start sync server
npm test             # Run tests
npm run typecheck    # Type checking
npm run lint         # Lint
npm run build        # Build for production
```

## License

MIT
