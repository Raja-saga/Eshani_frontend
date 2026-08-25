-- Run this in Cloudflare D1 dashboard > Console, or via wrangler:
-- npx wrangler d1 execute eshani-db --file=migrations/003_user_subscriptions.sql

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL,
  plan                TEXT NOT NULL,           -- 'monthly' | 'quarterly' | 'custom'
  amount              INTEGER NOT NULL,         -- in paise (₹1 = 100 paise)
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  status              TEXT DEFAULT 'active',   -- 'active' | 'expired' | 'cancelled'
  started_at          TEXT NOT NULL,
  expires_at          TEXT,                    -- NULL = lifetime (custom plan)
  created_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status  ON user_subscriptions(status);
