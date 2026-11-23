import "server-only";
import { Pool } from "pg";

type Row = Record<string, any>;
type Runner = (text: string, params: unknown[]) => Promise<Row[]>;

declare global {
  // eslint-disable-next-line no-var
  var __apRunner: Promise<Runner> | undefined;
  // eslint-disable-next-line no-var
  var __apSchema: Promise<void> | undefined;
}

function url() {
  const u = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!u) throw new Error("Banco de dados não configurado: defina DATABASE_URL (na Vercel, ligue o Neon em Storage).");
  return u;
}

async function criarRunner(): Promise<Runner> {
  const u = url();
  if (u.startsWith("pglite:")) {
    // Banco local para testes, sem servidor Postgres.
    const mod: any = await import(/* webpackIgnore: true */ "@electric-sql/pglite");
    const db = new mod.PGlite(u.slice(7) || undefined);
    return async (text, params) => (await db.query(text, params)).rows as Row[];
  }
  const pool = new Pool({ connectionString: u, max: 3, ssl: u.includes("localhost") ? undefined : { rejectUnauthorized: false } });
  return async (text, params) => (await pool.query(text, params as any[])).rows;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor JSONB NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS propostas (
    id SERIAL PRIMARY KEY,
    numero TEXT UNIQUE,
    cliente TEXT NOT NULL DEFAULT '',
    evento TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'rascunho',
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    versao INTEGER NOT NULL DEFAULT 1,
    dados JSONB NOT NULL,
    origem_id INTEGER,
    criado_por INTEGER REFERENCES usuarios(id),
    atualizado_por INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS proposta_versoes (
    id SERIAL PRIMARY KEY,
    proposta_id INTEGER NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    versao INTEGER NOT NULL,
    dados JSONB NOT NULL,
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    nota TEXT NOT NULL DEFAULT '',
    criado_por INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (proposta_id, versao)
  )`,
  `CREATE INDEX IF NOT EXISTS propostas_atualizado_idx ON propostas (atualizado_em DESC)`,
];

async function runner() {
  if (!globalThis.__apRunner) globalThis.__apRunner = criarRunner();
  return globalThis.__apRunner;
}

async function garantirSchema() {
  if (!globalThis.__apSchema) {
    globalThis.__apSchema = (async () => {
      const r = await runner();
      for (const s of SCHEMA) await r(s, []);
    })().catch((e) => {
      globalThis.__apSchema = undefined;
      throw e;
    });
  }
  return globalThis.__apSchema;
}

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  await garantirSchema();
  const r = await runner();
  return (await r(text, params)) as T[];
}

export async function q1<T = Row>(text: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(text, params))[0];
}

/** JSONB volta como objeto no pg e às vezes como string em outros drivers. */
export function json<T>(v: unknown): T {
  if (typeof v !== "string") return v as T;
  try {
    return JSON.parse(v) as T;
  } catch {
    return v as unknown as T; // driver já devolveu o texto puro
  }
}
