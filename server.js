require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
// ── PASSWORTSCHUTZ ────────────────────────────────────────────
const APP_PASSWORD = process.env.APP_PASSWORD || "agri2025";

app.use((req, res, next) => {
  // API-Routen und Login-Seite sind frei
  if (req.path.startsWith("/api/") || req.path === "/login") return next();
  // Auth-Cookie prüfen
  const cookies = req.headers.cookie || "";
  if (cookies.includes("agri_auth=ok")) return next();
  // Nicht eingeloggt → Login-Seite
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Agri Syria – Login</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#1B3A28;display:flex;align-items:center;justify-content:center;height:100vh}
.box{background:#fff;border-radius:16px;padding:2.5rem;width:340px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.ico{font-size:48px;margin-bottom:12px}.h{font-size:22px;font-weight:700;color:#1B3A28;margin-bottom:6px}
.sub{font-size:13px;color:#888;margin-bottom:1.5rem}
input{width:100%;padding:12px;border:1.5px solid #ddd;border-radius:8px;font-size:15px;margin-bottom:12px;text-align:center}
input:focus{outline:none;border-color:#1B3A28}
button{width:100%;padding:12px;background:#1B3A28;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;font-weight:600}
button:hover{background:#264D35}.err{color:#c00;font-size:13px;margin-top:8px;display:none}</style></head>
<body><div class="box"><div class="ico">🌾</div><div class="h">Agri Syria Export</div>
<div class="sub">Bitte Passwort eingeben</div>
<form method="POST" action="/login">
<input type="password" name="pw" placeholder="Passwort" autofocus>
<button type="submit">Anmelden →</button>
</form><div class="err" id="err">Falsches Passwort</div>
${req.query.err ? '<script>document.getElementById("err").style.display="block"</script>' : ''}
</div></body></html>`);
});

app.post("/login", express.urlencoded({ extended: false }), (req, res) => {
  if (req.body.pw === APP_PASSWORD) {
    res.setHeader("Set-Cookie", "agri_auth=ok; Path=/; HttpOnly; Max-Age=2592000");
    res.redirect("/");
  } else {
    res.redirect("/login?err=1");
  }
});

app.use(express.static(path.join(__dirname, "public")));

// ── DATENBANK ──────────────────────────────────────────────────
// Lokal: datenbank.json (oder DB_PATH in .env)
// Railway: PostgreSQL wenn DATABASE_URL gesetzt
let db = null;
const DATA_FILE = process.env.DB_PATH || path.join(__dirname, "datenbank.json");

async function initDB() {
  if (!process.env.DATABASE_URL) return;
  try {
    const { Pool } = require("pg");
    db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await db.query(`CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMP DEFAULT NOW());`);
    await db.query(`CREATE TABLE IF NOT EXISTS cost_log (id SERIAL PRIMARY KEY, ts TIMESTAMP DEFAULT NOW(), modul TEXT, query TEXT, input_tokens INT, output_tokens INT, cost_usd DECIMAL(10,6), user_name TEXT);`);
    console.log("✅ PostgreSQL verbunden");
  } catch (e) { console.log("PostgreSQL Fehler:", e.message, "→ nutze datenbank.json"); db = null; }
}

function localLoad() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch { return {}; }
}
function localSave(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── STORAGE ────────────────────────────────────────────────────
app.get("/api/storage/:key", async (req, res) => {
  try {
    if (db) {
      const r = await db.query("SELECT value FROM storage WHERE key=$1", [req.params.key]);
      return res.json({ value: r.rows[0] ? JSON.parse(r.rows[0].value) : null });
    }
    const data = localLoad();
    res.json({ value: data[req.params.key] ?? null });
  } catch (e) { res.json({ value: null }); }
});

app.post("/api/storage/:key", async (req, res) => {
  try {
    const value = JSON.stringify(req.body.value);
    if (db) {
      await db.query("INSERT INTO storage(key,value,updated_at) VALUES($1,$2,NOW()) ON CONFLICT(key) DO UPDATE SET value=$2,updated_at=NOW()", [req.params.key, value]);
    } else {
      const data = localLoad();
      data[req.params.key] = req.body.value;
      localSave(data);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.delete("/api/storage/:key", async (req, res) => {
  try {
    if (db) { await db.query("DELETE FROM storage WHERE key=$1", [req.params.key]); }
    else { const data = localLoad(); delete data[req.params.key]; localSave(data); }
    res.json({ ok: true });
  } catch { res.json({ ok: true }); }
});

// ── KOSTEN ─────────────────────────────────────────────────────
app.get("/api/costs", async (req, res) => {
  try {
    if (db) {
      const r = await db.query("SELECT ts, modul, query, input_tokens as \"inputTokens\", output_tokens as \"outputTokens\", cost_usd as \"costUSD\", user_name as \"userName\" FROM cost_log ORDER BY ts DESC LIMIT 200");
      return res.json(r.rows);
    }
    const data = localLoad();
    res.json(data["cost-log"] || []);
  } catch { res.json([]); }
});

app.delete("/api/costs", async (req, res) => {
  if (db) await db.query("DELETE FROM cost_log").catch(()=>{});
  else { const d = localLoad(); d["cost-log"] = []; localSave(d); }
  res.json({ ok: true });
});

app.post("/api/estimate", (req, res) => {
  const { system = "", user = "" } = req.body;
  const estInput = Math.ceil((system.length + user.length) / 4);
  res.json({ estInput, estOutput: 500, estCost: (estInput / 1e6 * 3) + (500 / 1e6 * 15) });
});

app.get("/api/db-info", (req, res) => {
  const isPostgres = !!db;
  let sizeKB = 0;
  if (!isPostgres && fs.existsSync(DATA_FILE)) {
    try { sizeKB = Math.round(fs.statSync(DATA_FILE).size / 1024 * 10) / 10; } catch {}
  }
  res.json({ path: isPostgres ? "PostgreSQL (Railway)" : DATA_FILE, exists: true, sizeKB, isPostgres });
});

// ── AI PROXY ───────────────────────────────────────────────────
const KEY_FILE = path.join(__dirname, "api-key.txt");
function getKey() {
  if (process.env.ANTHROPIC_API_KEY?.length > 20) return process.env.ANTHROPIC_API_KEY.trim();
  if (fs.existsSync(KEY_FILE)) return fs.readFileSync(KEY_FILE, "utf8").trim();
  return null;
}

app.post("/api/ai", async (req, res) => {
  const key = getKey();
  if (!key) return res.status(500).json({ error: { message: "Kein API Key. Bitte ANTHROPIC_API_KEY setzen." } });
  const { _modul, _query, _user, ...body } = req.body;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.usage) {
      const { input_tokens: i, output_tokens: o } = data.usage;
      const cost = (i / 1e6 * 3) + (o / 1e6 * 15);
      const entry = { ts: new Date().toISOString(), modul: _modul||"?", query: (_query||"").substring(0,80), inputTokens: i, outputTokens: o, costUSD: cost, userName: _user||"?" };
      if (db) {
        db.query("INSERT INTO cost_log(modul,query,input_tokens,output_tokens,cost_usd,user_name) VALUES($1,$2,$3,$4,$5,$6)", [_modul,entry.query,i,o,cost,_user||"?"]).catch(()=>{});
      } else {
        const d = localLoad();
        if (!d["cost-log"]) d["cost-log"] = [];
        d["cost-log"].unshift(entry);
        if (d["cost-log"].length > 500) d["cost-log"] = d["cost-log"].slice(0, 500);
        localSave(d);
      }
      data._cost = entry;
    }
    res.json(data);
  } catch (e) { res.status(500).json({ error: { message: e.message } }); }
});

// ── START ──────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌾 Agri Syria Export Tool`);
    console.log(`✅ http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${getKey() ? "OK" : "FEHLT"}`);
    console.log(`🗄️  DB: ${db ? "PostgreSQL" : DATA_FILE}\n`);
  });
});
