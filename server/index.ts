import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "vaultkeeper-dev-secret-change-in-production";
const PORT = parseInt(process.env.PORT || "3001", 10);

const db = new Database(join(__dirname, "vaultkeeper.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vaults (
    user_id TEXT PRIMARY KEY,
    vault_data TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    updated_by_device TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_name TEXT,
    last_seen INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    (req as any).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/register", (req, res) => {
  const { email, password, deviceId } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const id = crypto.randomUUID();
  const hash = bcrypt.hashSync(password, 10);
  const now = Date.now();

  db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)").run(
    id, email, hash, now
  );

  if (deviceId) {
    db.prepare("INSERT OR REPLACE INTO devices (id, user_id, last_seen) VALUES (?, ?, ?)").run(
      deviceId, id, now
    );
  }

  const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, userId: id });
});

app.post("/api/login", (req, res) => {
  const { email, password, deviceId } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (deviceId) {
    db.prepare("INSERT OR REPLACE INTO devices (id, user_id, last_seen) VALUES (?, ?, ?)").run(
      deviceId, user.id, Date.now()
    );
  }

  const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, userId: user.id });
});

app.post("/api/vault/push", authMiddleware, (req, res) => {
  const { vault, deviceId } = req.body;
  const userId = (req as any).userId;
  const now = Date.now();

  const existing = db.prepare("SELECT updated_at FROM vaults WHERE user_id = ?").get(userId) as any;

  if (existing) {
    db.prepare("UPDATE vaults SET vault_data = ?, updated_at = ?, updated_by_device = ? WHERE user_id = ?").run(
      JSON.stringify(vault), now, deviceId, userId
    );
  } else {
    db.prepare("INSERT INTO vaults (user_id, vault_data, updated_at, updated_by_device) VALUES (?, ?, ?, ?)").run(
      userId, JSON.stringify(vault), now, deviceId
    );
  }

  res.json({ success: true, updatedAt: now });
});

app.get("/api/vault/pull", authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  const row = db.prepare("SELECT * FROM vaults WHERE user_id = ?").get(userId) as any;

  if (!row) {
    res.status(404).json({ error: "No vault found" });
    return;
  }

  res.json({ vault: JSON.parse(row.vault_data), updatedAt: row.updated_at });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`  🔐 VaultKeeper sync server running on port ${PORT}`);
});
