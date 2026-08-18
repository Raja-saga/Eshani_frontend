/**
 * Cloudflare D1 client via REST API.
 * Works in local Next.js dev (`npm run dev`) AND on Cloudflare Pages.
 * Requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN in env.
 */

const ACCOUNT_ID   = process.env.CLOUDFLARE_ACCOUNT_ID!;
const DATABASE_ID  = process.env.CLOUDFLARE_D1_DATABASE_ID!;
const API_TOKEN    = process.env.CLOUDFLARE_D1_TOKEN!;

const D1_URL = () =>
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

interface D1Meta {
  changes: number;
  last_row_id: number;
  duration: number;
}

interface D1ApiResponse<T> {
  result: Array<{ results: T[]; success: boolean; meta: D1Meta }>;
  success: boolean;
  errors: Array<{ code: number; message: string }>;
}

async function d1Fetch<T>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<D1ApiResponse<T>> {
  if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
    throw new Error(
      'Missing D1 env vars. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN in .env.local'
    );
  }

  const res = await fetch(D1_URL(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`D1 HTTP ${res.status}: ${body}`);
  }

  return res.json() as Promise<D1ApiResponse<T>>;
}

/** Run a SELECT — returns an array of rows. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const data = await d1Fetch<T>(sql, params);
  if (!data.success || data.errors?.length) {
    throw new Error(`D1 query error: ${JSON.stringify(data.errors)}`);
  }
  return data.result[0]?.results ?? [];
}

/** Run an INSERT / UPDATE / DELETE — returns change metadata. */
export async function run(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<D1Meta> {
  const data = await d1Fetch(sql, params);
  if (!data.success || data.errors?.length) {
    throw new Error(`D1 run error: ${JSON.stringify(data.errors)}`);
  }
  return data.result[0].meta;
}

/** Run a SELECT expecting exactly one row (or null). */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
