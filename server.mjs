import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import crypto from "crypto";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar trust proxy para funcionar com Nginx
app.set('trust proxy', 1); // Confiar no primeiro proxy (Nginx)

app.use(compression()); // Comprimir respostas
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Reduzir limite

// JWT Secret removido por segurança

// Rate limiting CRÍTICO para evitar sobrecarga

// Rate limiting amigável para consultas de tracking (brasileiros são leigos)
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 consultas por IP por minuto (mais flexível)
  message: { error: 'Muitas consultas. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Confiar no proxy
  skip: (req) => {
    // Permitir mais requisições para localhost em desenvolvimento
    return req.ip === '127.0.0.1' || req.ip === '::1';
  }
});

// Rate limiting para pagamentos (menos restritivo para brasileiros)
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 tentativas de pagamento por IP por minuto
  message: { error: 'Muitas tentativas de pagamento. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Confiar no proxy
});

// Rate limiting geral para todas as rotas
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requisições por IP por minuto
  message: { error: 'Muitas requisições. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Confiar no proxy
});

app.use(generalLimiter);

// Middleware de autenticação removido por segurança

// Middleware de segurança adicional
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};

app.use(securityHeaders);

// SQLite setup
const db = new Database("data.sqlite");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    fields_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    tarifa_brl INTEGER
  );
`);

// ÍNDICES OTIMIZADOS para performance crítica
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_tracking ON leads(fields_json);
  CREATE INDEX IF NOT EXISTS idx_leads_cpf ON leads(fields_json);
  CREATE INDEX IF NOT EXISTS idx_payments_tracking ON payments(tracking);
  CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
  CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
`);

// Otimizações SQLite para performance
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = 10000");
db.pragma("temp_store = MEMORY");
db.pragma("mmap_size = 268435456"); // 256MB

// Migration: ensure tarifa_brl column exists on existing DBs
try {
  const cols = db.prepare(`PRAGMA table_info(leads)`).all();
  const hasTarifa = Array.isArray(cols) && cols.some((c) => String(c.name) === 'tarifa_brl');
  if (!hasTarifa) {
    db.exec(`ALTER TABLE leads ADD COLUMN tarifa_brl INTEGER`);
  }
} catch (e) {
  console.error('Failed to migrate leads table:', e);
}

// Tabela admin removida por segurança

// Tabela admin_config removida por segurança

// Funções de criptografia removidas por segurança
// Migrações de admin_config removidas por segurança

// Migrações de admin removidas por segurança

const insertLeadStmt = db.prepare(
  `INSERT OR REPLACE INTO leads (id, fields_json, status, created_at, tarifa_brl) VALUES (@id, @fields_json, @status, @created_at, @tarifa_brl)`
);
const updateLeadStmt = db.prepare(
  `UPDATE leads SET fields_json = COALESCE(@fields_json, fields_json), status = COALESCE(@status, status) WHERE id = @id`
);
const deleteLeadStmt = db.prepare(`DELETE FROM leads WHERE id = ?`);
const getLeadStmt = db.prepare(`SELECT * FROM leads WHERE id = ?`);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/leads", (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const pageSizeRaw = Math.max(1, parseInt(String(req.query.pageSize || '20'), 10) || 20);
  const pageSize = Math.min(20, pageSizeRaw); // REDUZIR PARA 20 REGISTROS MAX
  const q = (req.query.q ? String(req.query.q) : '').trim();
  const status = (req.query.status ? String(req.query.status).toLowerCase() : '').trim();

  const where = [];
  const params = {};
  if (q) { where.push('LOWER(fields_json) LIKE @q'); params.q = `%${q.toLowerCase()}%`; }
  if (status === 'paid' || status === 'pending') { where.push('LOWER(status) = @status'); params.status = status; }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Otimização: só contar se realmente precisar (primeira página)
  let total = 0;
  if (page === 1) {
    total = db.prepare(`SELECT COUNT(*) as c FROM leads ${whereSql}`).get(params).c;
  }
  
  const offset = (page - 1) * pageSize;
  const rows = db
    .prepare(`SELECT * FROM leads ${whereSql} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: pageSize, offset });
  const leads = rows.map((r) => ({
    id: r.id,
    fields: JSON.parse(r.fields_json),
    status: r.status,
    createdAt: r.created_at,
    tarifaBrl: typeof r.tarifa_brl === 'number' ? r.tarifa_brl : null,
  }));
  res.json({ leads, page, pageSize, total });
});

// Simple search by CPF or Tracking (substring match over JSON)
// Helpers to compute tarifa from USD and config
function parseUsdValue(raw) {
  try {
    const txt = String(raw || '').trim();
    if (!txt) return 0;
    const m = txt.match(/([0-9]+[\.,]?[0-9]{0,2})/);
    if (!m) return 0;
    let n = m[1];
    if (n.includes(',') && !n.includes('.')) n = n.replace(',', '.');
    n = n.replace(/,/g, '');
    const v = Number.parseFloat(n);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

function computeTarifaFromRowCents(row, cfg) {
  try {
    const fields = JSON.parse(row.fields_json || '{}');
    const usd = parseUsdValue(fields['Product Value']);
    
    // Usar configurações do .env se cfg não estiver disponível
    const taxPercent = (cfg && typeof cfg.tax_percent === 'number' && cfg.tax_percent >= 0) 
      ? cfg.tax_percent 
      : (process.env.TAX_PERCENT ? parseInt(process.env.TAX_PERCENT) : 50);
    
    const rateCents = (cfg && typeof cfg.usd_brl_rate_cents === 'number' && cfg.usd_brl_rate_cents > 0) 
      ? cfg.usd_brl_rate_cents 
      : (process.env.USD_BRL_RATE_CENTS ? parseInt(process.env.USD_BRL_RATE_CENTS) : 520);
    
    console.log('[CALC] Computing tarifa:', { usd, taxPercent, rateCents });
    
    if (!rateCents || usd <= 0) {
      // Se não conseguir calcular, usar valor mínimo
      console.log('[CALC] Using default minimum value');
      return parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471;
    }
    
    let cents = Math.round(usd * rateCents * (taxPercent / 100));
    console.log('[CALC] Calculated cents:', cents);
    
    // Regra de valor mínimo: se menor que R$ 64,71 (6471 centavos), setar para R$ 64,71
    if (cents < 6471) {
      cents = 6471;
    }
    
    // Regra de valor máximo: se maior que R$ 250,00 (25000 centavos), setar para R$ 239,87 (23987 centavos)
    if (cents > 25000) {
      cents = 23987;
    }
    
    console.log('[CALC] Final value:', cents);
    return cents > 0 ? cents : 6471; // Garantir que nunca retorna 0
  } catch (e) {
    console.error('[CALC] Error:', e);
    return parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471; // Valor mínimo em caso de erro
  }
}

app.get("/api/leads/search", (req, res) => {
  const { cpf, tracking } = req.query || {};
  let where = [];
  let params = {};
  if (cpf && typeof cpf === 'string') {
    where.push("LOWER(fields_json) LIKE @cpf");
    params.cpf = `%${cpf.toLowerCase()}%`;
  }
  if (tracking && typeof tracking === 'string') {
    where.push("LOWER(fields_json) LIKE @tracking");
    params.tracking = `%${tracking.toLowerCase()}%`;
  }
  if (where.length === 0) {
    return res.status(400).json({ error: "Provide cpf or tracking" });
  }
  const sql = `SELECT * FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 50`;
  const rows = db.prepare(sql).all(params);
  const cfg = {
    tarifa_brl_default: parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471,
    tax_percent: parseInt(process.env.TAX_PERCENT) || 50,
    usd_brl_rate_cents: parseInt(process.env.USD_BRL_RATE_CENTS) || 520
  };
  const defaultTarifa = cfg.tarifa_brl_default;
  const leads = rows.map((r) => {
    const stored = typeof r.tarifa_brl === 'number' ? r.tarifa_brl : null;
    const computed = computeTarifaFromRowCents(r, cfg);
    let tarifa = stored ?? computed ?? defaultTarifa ?? null;
    
    // Aplicar regras de valor mínimo e máximo
    if (tarifa) {
      if (tarifa < 6471) {
        tarifa = 6471; // Mínimo R$ 64,71
      }
      if (tarifa > 25000) {
        tarifa = 23987; // Máximo R$ 239,87
      }
    }
    return {
      id: r.id,
      fields: JSON.parse(r.fields_json),
      status: r.status,
      createdAt: r.created_at,
      tarifaBrl: tarifa,
    };
  });
  res.json({ leads });
});

// Get a single lead by tracking exact match (case-insensitive) - OTIMIZADO COM CACHE
app.get("/api/leads/by-tracking/:code", trackingLimiter, (req, res) => {
  const code = String(req.params.code || '').trim().toLowerCase();
  if (!code) return res.status(400).json({ error: 'Tracking required' });
  
  // Verificar cache primeiro
  const cacheKey = `tracking:${code}`;
  const cached = trackingCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < TRACKING_CACHE_TTL) {
    console.log(`[CACHE] Hit para tracking ${code}`);
    return res.json(cached.data);
  }
  
  // Busca ultra-otimizada com timeout
  const startTime = Date.now();
  const rows = db.prepare(`
    SELECT * FROM leads 
    WHERE fields_json LIKE ? 
    ORDER BY created_at DESC 
    LIMIT 5
  `).all(`%"Tracking":"${code.toUpperCase()}"%`);
  
  console.log(`[PERF] Busca tracking ${code} levou ${Date.now() - startTime}ms`);
  
  let found = null;
  for (const r of rows) {
    try {
      const f = JSON.parse(r.fields_json || '{}');
      const t = String(f.Tracking || '').trim().toLowerCase();
      if (t === code) { found = r; break; }
    } catch {}
  }
  
  if (!found) {
    // Cache resultado negativo por 30 segundos
    trackingCache.set(cacheKey, { 
      data: { error: 'Not found' }, 
      timestamp: Date.now() 
    });
    return res.status(404).json({ error: 'Not found' });
  }
  
  const cfg = {
    tarifa_brl_default: parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471,
    tax_percent: parseInt(process.env.TAX_PERCENT) || 50,
    usd_brl_rate_cents: parseInt(process.env.USD_BRL_RATE_CENTS) || 520
  };
  const defaultTarifa = cfg.tarifa_brl_default;
  const stored = typeof found.tarifa_brl === 'number' ? found.tarifa_brl : null;
  const computed = computeTarifaFromRowCents(found, cfg);
  let tarifa = stored ?? computed ?? defaultTarifa ?? null;
  
  // Aplicar regras de valor mínimo e máximo
  if (tarifa) {
    if (tarifa < 6471) {
      tarifa = 6471; // Mínimo R$ 64,71
    }
    if (tarifa > 25000) {
      tarifa = 23987; // Máximo R$ 239,87
    }
  }
  
  const result = {
    id: found.id,
    fields: JSON.parse(found.fields_json),
    status: found.status,
    createdAt: found.created_at,
    tarifaBrl: tarifa,
  };
  
  // Cache resultado positivo
  trackingCache.set(cacheKey, { 
    data: result, 
    timestamp: Date.now() 
  });
  
  return res.json(result);
});

// CACHE EM MEMÓRIA para consultas frequentes
const cache = new Map();
const CACHE_TTL = 30000; // 30 segundos

// Cache para métricas (atualiza a cada 30 segundos)
let metricsCache = null;
let lastMetricsUpdate = 0;

// Cache para consultas de tracking
const trackingCache = new Map();
const TRACKING_CACHE_TTL = 60000; // 1 minuto

// Função para limpar cache expirado
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
  for (const [key, value] of trackingCache.entries()) {
    if (now - value.timestamp > TRACKING_CACHE_TTL) {
      trackingCache.delete(key);
    }
  }
}, 10000); // Limpar a cada 10 segundos

app.get("/api/leads/metrics", (req, res) => {
  const now = Date.now();
  
  // Se cache é válido (menos de 30s), usar cache
  if (metricsCache && (now - lastMetricsUpdate) < 30000) {
    return res.json(metricsCache);
  }
  
  // Atualizar cache
  const total = db.prepare(`SELECT COUNT(*) as c FROM leads`).get().c;
  const paid = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'paid'`).get().c;
  const pending = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'pending'`).get().c;
  
  metricsCache = { total, paid, pending };
  lastMetricsUpdate = now;
  
  res.json(metricsCache);
});

// ===== ROTAS DE AUTENTICAÇÃO REMOVIDAS POR SEGURANÇA =====

// ===== ROTAS ADMIN REMOVIDAS POR SEGURANÇA =====

// ===== ROTA SEGURA PARA IMPORTAÇÃO DE LEADS =====

// Middleware de autenticação simples para importação
const authenticateImport = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // Token secreto para importação (definir no .env)
  const IMPORT_SECRET = process.env.IMPORT_SECRET || 'import_secret_2025';
  
  if (!token || token !== IMPORT_SECRET) {
    return res.status(401).json({ error: 'Token de importação inválido' });
  }
  
  next();
};

// Rota segura para importar leads via CSV
app.post("/api/secure/import-leads", authenticateImport, (req, res) => {
  try {
    const { rows } = req.body || {};
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Array de leads é obrigatório" });
    }
    
    const now = Date.now();
    const cfg = {
      tarifa_brl_default: parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471,
      tax_percent: parseInt(process.env.TAX_PERCENT) || 50,
      usd_brl_rate_cents: parseInt(process.env.USD_BRL_RATE_CENTS) || 520
    };
    
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        const id = item.id || crypto.randomUUID();
        const status = item.status === "paid" ? "paid" : "pending";
        const created_at = item.createdAt || now;
        const tarifa_brl = typeof item.tarifa_brl === 'number' ? item.tarifa_brl : null;
        
        insertLeadStmt.run({
          id,
          fields_json: JSON.stringify(item.fields || item),
          status,
          created_at,
          tarifa_brl,
        });
      }
    });
    
    insertMany(rows);
    console.log(`[SECURE IMPORT] ${rows.length} leads importados com sucesso`);
    
    res.json({ 
      success: true, 
      imported: rows.length,
      message: `${rows.length} leads importados com sucesso`
    });
    
  } catch (error) {
    console.error('[SECURE IMPORT] Erro:', error);
    res.status(500).json({ 
      error: "Falha na importação", 
      details: error.message 
    });
  }
});

// Rota para verificar status da importação
app.get("/api/secure/import-status", authenticateImport, (req, res) => {
  try {
    const total = db.prepare(`SELECT COUNT(*) as c FROM leads`).get().c;
    const paid = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'paid'`).get().c;
    const pending = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status = 'pending'`).get().c;
    
    res.json({
      success: true,
      stats: {
        total,
        paid,
        pending
      }
    });
  } catch (error) {
    console.error('[SECURE IMPORT] Erro no status:', error);
    res.status(500).json({ error: "Falha ao obter status" });
  }
});

app.post("/api/leads/import", (req, res) => {
  const { rows } = req.body || {};
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: "Body must include array 'rows'" });
  }
  const now = Date.now();
  const cfg = {
    tarifa_brl_default: parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471,
    tax_percent: parseInt(process.env.TAX_PERCENT) || 50,
    usd_brl_rate_cents: parseInt(process.env.USD_BRL_RATE_CENTS) || 520
  };
  const defaultTarifa = null; // keep null to compute dynamically later
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      const id = item.id || crypto.randomUUID();
      const status = item.status === "paid" ? "paid" : "pending";
      const created_at = item.createdAt || now;
      const tarifa_brl = typeof item.tarifa_brl === 'number' ? item.tarifa_brl : defaultTarifa;
      insertLeadStmt.run({
        id,
        fields_json: JSON.stringify(item.fields || item),
        status,
        created_at,
        tarifa_brl,
      });
    }
  });
  try {
    insertMany(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to import" });
  }
  res.json({ ok: true, inserted: rows.length });
});

// TODAS AS ROTAS DE ADMIN REMOVIDAS PERMANENTEMENTE POR SEGURANÇA

app.put("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const { fields, status, tarifaBrl } = req.body || {};
  const existing = getLeadStmt.get(id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  try {
    const upd = db.prepare(`UPDATE leads SET fields_json = COALESCE(@fields_json, fields_json), status = COALESCE(@status, status), tarifa_brl = COALESCE(@tarifa_brl, tarifa_brl) WHERE id = @id`);
    upd.run({ id, fields_json: fields ? JSON.stringify(fields) : null, status: typeof status === 'string' ? status : null, tarifa_brl: typeof tarifaBrl === 'number' ? tarifaBrl : null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update" });
  }
  const updated = getLeadStmt.get(id);
  res.json({
    id: updated.id,
    fields: JSON.parse(updated.fields_json),
    status: updated.status,
    createdAt: updated.created_at,
    tarifaBrl: typeof updated.tarifa_brl === 'number' ? updated.tarifa_brl : null,
  });
});

app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  try {
    deleteLeadStmt.run(id);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete" });
  }
  res.json({ ok: true });
});

// Payments table and endpoints
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    lead_id TEXT,
    tracking TEXT,
    amount_brl INTEGER,
    status TEXT,
    provider TEXT,
    category TEXT,
    title TEXT,
    data_json TEXT,
    created_at INTEGER NOT NULL
  );
`);
// Migration: ensure 'category' column exists on payments
try {
  const pcols = db.prepare(`PRAGMA table_info(payments)`).all();
  const hasCategory = Array.isArray(pcols) && pcols.some((c) => String(c.name) === 'category');
  const hasTitle = Array.isArray(pcols) && pcols.some((c) => String(c.name) === 'title');
  if (!hasCategory) {
    db.exec(`ALTER TABLE payments ADD COLUMN category TEXT`);
  }
  if (!hasTitle) {
    db.exec(`ALTER TABLE payments ADD COLUMN title TEXT`);
  }
} catch (e) {
  console.error('Failed to migrate payments table:', e);
}

app.get('/api/payments/recent', (req, res) => {
  const rows = db.prepare(`SELECT * FROM payments ORDER BY created_at DESC LIMIT 50`).all();
  const payments = rows.map(r => ({ id: r.id, leadId: r.lead_id, tracking: r.tracking, amountBrl: r.amount_brl, status: r.status, provider: r.provider, category: r.category || null, title: r.title || null, createdAt: r.created_at }));
  res.json({ payments });
});

// Payments aggregated metrics
app.get('/api/payments/metrics', (req, res) => {
  const rowTotal = db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(amount_brl), 0) as s FROM payments`).get();
  const rowPaid = db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(amount_brl), 0) as s FROM payments WHERE LOWER(status) = 'paid'`).get();
  const ordersTotal = rowTotal?.c || 0;
  const ordersPaid = rowPaid?.c || 0;
  const ordersPending = Math.max(0, ordersTotal - ordersPaid);
  const revenueTotal = rowTotal?.s || 0;
  const revenuePaid = rowPaid?.s || 0;
  const revenuePending = Math.max(0, revenueTotal - revenuePaid);
  res.json({ ordersTotal, ordersPaid, ordersPending, revenueTotal, revenuePaid, revenuePending });
});

app.get('/api/payments/by-tracking/:code', (req, res) => {
  const code = String(req.params.code || '');
  const rows = db.prepare(`SELECT * FROM payments WHERE tracking = @t ORDER BY created_at DESC`).all({ t: code });
  const payments = rows.map(r => ({ id: r.id, leadId: r.lead_id, tracking: r.tracking, amountBrl: r.amount_brl, status: r.status, provider: r.provider, createdAt: r.created_at }));
  res.json({ payments });
});

// Cache para evitar múltiplos pagamentos simultâneos
const pendingPayments = new Map();

app.post('/api/payments/pix', paymentLimiter, async (req, res) => {
  try {
    const { leadId, tracking, amountCents, title, category: categoryHint } = req.body || {};
    const leadRow = leadId
      ? db.prepare(`SELECT * FROM leads WHERE id = @id`).get({ id: leadId })
      : db.prepare(`SELECT * FROM leads WHERE LOWER(fields_json) LIKE @needle LIMIT 1`).get({ needle: `%\"tracking\":\"${String(tracking||'').toLowerCase()}%` });
    if (!leadRow) return res.status(404).json({ error: 'Lead not found' });
    
    const trackingCode = String(tracking || leadRow.fields_json.match(/"Tracking":"([^"]+)"/)?.[1] || '');
    
    // Verificar se já tem pagamento pendente para este tracking
    if (pendingPayments.has(trackingCode)) {
      console.log('[PIX] Pagamento já em andamento para:', trackingCode);
      return res.status(429).json({ error: 'Pagamento já está sendo processado. Aguarde.' });
    }
    
    // Verificar se já existe pagamento PAGO para a mesma categoria (evitar duplicação)
    const existingPaidPayment = db.prepare(`
      SELECT * FROM payments 
      WHERE tracking = ? AND status = 'paid' AND category = ?
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(trackingCode, category);
    
    if (existingPaidPayment) {
      console.log('[PIX] Pagamento já pago encontrado para categoria:', { id: existingPaidPayment.id, category, created: new Date(existingPaidPayment.created_at) });
      return res.status(409).json({ 
        error: `Pagamento de ${category} já foi realizado`,
        existingPayment: {
          id: existingPaidPayment.id,
          status: existingPaidPayment.status,
          category: existingPaidPayment.category,
          createdAt: existingPaidPayment.created_at
        }
      });
    }
    
    // Marcar como em processamento
    pendingPayments.set(trackingCode, Date.now());
    const lead = { id: leadRow.id, fields: JSON.parse(leadRow.fields_json), tarifaBrl: typeof leadRow.tarifa_brl === 'number' ? leadRow.tarifa_brl : null };
    
    // Usar configurações do .env em vez do banco
    const cfg = {
      tarifa_brl_default: parseInt(process.env.TARIFA_BRL_DEFAULT) || 6471,
      tax_percent: parseInt(process.env.TAX_PERCENT) || 50,
      usd_brl_rate_cents: parseInt(process.env.USD_BRL_RATE_CENTS) || 520
    };
    
    // Determinar qual chave usar baseado na categoria
    const titleStr = String(title || lead.fields['Product'] || 'Tarifa');
    const category = typeof categoryHint === 'string' && categoryHint
      ? String(categoryHint).toLowerCase()
      : ((String(titleStr).toLowerCase().includes('nf-e') || String(titleStr).toLowerCase().includes('nfe'))
          ? 'nfe'
          : (String(titleStr).toLowerCase().includes('reagendamento') ? 'reagendamento' : 'tarifa'));
    
    console.log('[PIX] Categoria detectada:', category, 'Title:', titleStr, 'CategoryHint:', categoryHint);
    
    let pk, sk;
    if (category === 'nfe') {
      pk = process.env.HYDRA_PK_NFE;
      sk = process.env.HYDRA_SK_NFE;
      console.log('[Hydra] Usando chaves NFE para categoria:', category);
      console.log('[Hydra] NFE PK disponível:', !!pk, 'NFE SK disponível:', !!sk);
    } else if (category === 'reagendamento') {
      pk = process.env.HYDRA_PK_REAGENDAMENTO;
      sk = process.env.HYDRA_SK_REAGENDAMENTO;
      console.log('[Hydra] Usando chaves REAGENDAMENTO para categoria:', category);
      console.log('[Hydra] REAGENDAMENTO PK disponível:', !!pk, 'REAGENDAMENTO SK disponível:', !!sk);
    } else {
      pk = process.env.HYDRA_PK;
      sk = process.env.HYDRA_SK;
      console.log('[Hydra] Usando chaves PADRÃO para categoria:', category);
      console.log('[Hydra] PADRÃO PK disponível:', !!pk, 'PADRÃO SK disponível:', !!sk);
    }
    
    if (!pk || !sk) {
      console.error('[PIX] Chaves não configuradas para categoria:', category);
      console.error('[PIX] PK disponível:', !!pk, 'SK disponível:', !!sk);
      return res.status(400).json({ error: `Keys not set for category: ${category}` });
    }
    let amount = Number.isInteger(amountCents) && amountCents > 0 ? amountCents : (lead.tarifaBrl ?? null);
    if (amount === null || amount === undefined) {
      const row = db.prepare(`SELECT * FROM leads WHERE id = @id`).get({ id: lead.id });
      const computed = row ? computeTarifaFromRowCents(row, cfg) : null;
      amount = computed ?? (cfg.tarifa_brl_default ?? 0);
    }
    if (!amount || amount <= 0) {
      console.error('[PIX ERROR] Invalid amount:', { amount, leadId: lead.id, tarifaBrl: lead.tarifaBrl });
      return res.status(400).json({ error: 'Invalid amount', debug: { amount, leadId: lead.id } });
    }
    
    console.log('[PIX] Creating payment:', { leadId: lead.id, amount, category, title: titleStr });
    
    const hydraUrl = 'https://api.novaera-pagamentos.com/api/v1/transactions';
    const customerDoc = String(lead.fields['CPF'] || '').replace(/\D/g, '');
    const rawPhone = String(lead.fields['Telephone'] || '').replace(/\D/g, '');
    // Corrigir telefone: remover código do país se muito longo e garantir formato correto
    let phone = rawPhone;
    if (rawPhone.startsWith('55') && rawPhone.length > 11) {
      phone = rawPhone.slice(-11); // Remove código do país
    } else if (rawPhone.length > 11) {
      phone = rawPhone.slice(-11); // Pega os últimos 11 dígitos
    }
    // Garantir que o telefone tenha pelo menos 10 dígitos
    if (phone.length < 10) {
      phone = '11999999999'; // Telefone padrão se inválido
    }
    
    const productImage = String(lead.fields['product_image'] || lead.fields['image'] || 'https://seusite.com.br/imagens/produto.png');
    const configuredPostback = process.env.POSTBACK_URL || '';
    const postbackUrl = /^https?:\/\//i.test(configuredPostback) ? configuredPostback : undefined;
    
    // Truncar título do produto se muito longo (máximo 100 caracteres)
    const productTitle = String(title || lead.fields['Product'] || 'Tarifa');
    const truncatedTitle = productTitle.length > 100 ? productTitle.substring(0, 97) + '...' : productTitle;
    
    // Validar e limpar dados do cliente
    const customerName = String(lead.fields['Name'] || '')
      .replace(/[^\w\s\-\.]/g, '') // Remove caracteres especiais
      .substring(0, 50) // Máximo 50 caracteres
      .trim();
    
    const customerEmail = String(lead.fields['Email'] || '')
      .toLowerCase()
      .substring(0, 100)
      .trim();
    
    // Validar CPF
    if (customerDoc.length !== 11) {
      console.error('[PIX] CPF inválido:', customerDoc);
      return res.status(400).json({ error: 'CPF inválido', cpf: customerDoc });
    }
    
    // Validar email básico
    if (!customerEmail.includes('@') || !customerEmail.includes('.')) {
      console.error('[PIX] Email inválido:', customerEmail);
      return res.status(400).json({ error: 'Email inválido', email: customerEmail });
    }
    
    // Validar nome
    if (!customerName || customerName.length < 3) {
      console.error('[PIX] Nome inválido:', customerName);
      return res.status(400).json({ error: 'Nome inválido', name: customerName });
    }
    
    const body = {
      paymentMethod: 'pix',
      ip: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || '127.0.0.1',
      pix: { expiresInDays: 1 },
      items: [ { 
        title: truncatedTitle, 
        quantity: 1, 
        tangible: false, 
        unitPrice: amount, 
        product_image: productImage 
      } ],
      amount: amount,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: phone,
        document: { type: 'cpf', number: customerDoc }
      },
      metadata: JSON.stringify({ provider: 'Hydra Checkout', user_email: customerEmail }),
      traceable: false,
      externalRef: String(lead.fields['Tracking'] || lead.id),
      ...(postbackUrl ? { postbackUrl } : {})
    };
    const authPrimary = Buffer.from(`${sk}:${pk}`).toString('base64');
    console.log('[Hydra] Attempt 1 sk:pk', { pk_mask: pk.slice(0,6)+'...', sk_mask: sk.slice(0,6)+'...', category });
    console.log('[Hydra] Customer data:', { name: customerName, email: customerEmail, phone, cpf: customerDoc });
    console.log('[Hydra] Request body:', JSON.stringify(body, null, 2));
    let r = await fetch(hydraUrl, { method: 'POST', headers: { 'Authorization': `Basic ${authPrimary}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let data = await r.json().catch(() => ({}));
    console.log('[Hydra] Response 1', { status: r.status, success: data?.success, message: data?.message });
    console.log('[Hydra] Response 1 data:', JSON.stringify(data, null, 2));
    if (r.status === 401 || String(data?.message || '').toLowerCase().includes('unauthorized')) {
      const authFallback = Buffer.from(`${pk}:${sk}`).toString('base64');
      console.log('[Hydra] Attempt 2 pk:sk');
      r = await fetch(hydraUrl, { method: 'POST', headers: { 'Authorization': `Basic ${authFallback}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      data = await r.json().catch(() => ({}));
      console.log('[Hydra] Response 2', { status: r.status, success: data?.success, message: data?.message });
      console.log('[Hydra] Response 2 data:', JSON.stringify(data, null, 2));
    }
    if (!r.ok || data?.success === false) { 
      console.error('[PIX] Erro na API Hydra:', { status: r.status, ok: r.ok, success: data?.success, data });
      return res.status(r.status || 500).json({ error: 'Hydra error', data }); 
    }
    const payId = String(data?.data?.secureId || data?.data?.id || crypto.randomUUID());
    // Log final antes de salvar
    console.log('[PIX] Saving payment:', { payId, amount_brl: amount, status: data?.data?.status });
    
    db.prepare(`INSERT OR REPLACE INTO payments (id, lead_id, tracking, amount_brl, status, provider, category, title, data_json, created_at) VALUES (@id, @lead_id, @tracking, @amount_brl, @status, @provider, @category, @title, @data_json, @created_at)`).run({ 
      id: payId, 
      lead_id: lead.id, 
      tracking: lead.fields['Tracking'] || '', 
      amount_brl: amount, 
      status: String(data?.data?.status || 'pending'), 
      provider: 'hydra', 
      category, 
      title: titleStr, 
      data_json: JSON.stringify(data), 
      created_at: Date.now() 
    });
    
    console.log('[PIX] Payment saved successfully');
    
    // Limpar cache após sucesso
    pendingPayments.delete(trackingCode);
    
    const response = { ok: true, payment: { id: payId, status: data?.data?.status, secureUrl: data?.data?.secureUrl, qrcode: data?.data?.pix?.qrcode, amount } };
    console.log('[PIX] Resposta final:', JSON.stringify(response, null, 2));
    return res.json(response);
  } catch (e) {
    console.error('[PIX] Erro geral:', e);
    console.error('[PIX] Stack trace:', e.stack);
    
    // Limpar cache em caso de erro também
    const trackingCode = String(req.body?.tracking || '');
    if (trackingCode) {
      pendingPayments.delete(trackingCode);
    }
    
    return res.status(500).json({ error: 'Failed to create payment', details: e.message });
  }
});

// TODAS AS ROTAS DE LIMPEZA REMOVIDAS PERMANENTEMENTE

app.post('/api/payments/webhook', (req, res) => {
  try {
    const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const secureId = parsed?.data?.secureId || parsed?.data?.id;
    const status = parsed?.data?.status || parsed?.status;
    if (!secureId) return res.status(400).json({ error: 'Missing id' });
    const row = db.prepare(`SELECT * FROM payments WHERE id = @id`).get({ id: String(secureId) });
    if (row) {
      db.prepare(`UPDATE payments SET status = @status, data_json = @data_json WHERE id = @id`).run({ id: String(secureId), status: String(status||'pending'), data_json: JSON.stringify(parsed) });
      if (String(status).toLowerCase() === 'paid') {
        const ext = parsed?.data?.externalId || parsed?.data?.externalRef || '';
        const leadRow = db.prepare(`SELECT * FROM leads WHERE LOWER(fields_json) LIKE @needle LIMIT 1`).get({ needle: `%\"tracking\":\"${String(ext).toLowerCase()}%` });
        if (leadRow) db.prepare(`UPDATE leads SET status='paid' WHERE id=@id`).run({ id: leadRow.id });
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

// Monitoramento de performance
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

// Middleware de monitoramento
app.use((req, res, next) => {
  requestCount++;
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) errorCount++;
    
    // Log requisições lentas (>1s)
    if (duration > 1000) {
      console.log(`[SLOW] ${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`);
    }
  });
  
  next();
});

// Endpoint de status do servidor
app.get('/api/status', (req, res) => {
  const uptime = Date.now() - startTime;
  const avgRequestsPerMinute = (requestCount / (uptime / 60000)).toFixed(2);
  
  res.json({
    status: 'ok',
    uptime: Math.floor(uptime / 1000),
    requests: requestCount,
    errors: errorCount,
    avgRequestsPerMinute,
    cacheSize: trackingCache.size,
    memoryUsage: process.memoryUsage()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server listening on http://localhost:${PORT}`);
  console.log(`📊 Monitoramento: http://localhost:${PORT}/api/status`);
  console.log(`⚡ Otimizações aplicadas: Rate limiting, Cache, Compressão, Índices`);
});



