-- ============================================================
--  LASH ART VISION v2.0 — Supabase PostgreSQL Schema
--  Run this in Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. ENUM types
CREATE TYPE user_role AS ENUM ('client', 'master');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'done', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'image', 'analysis_card');
CREATE TYPE platform_type AS ENUM ('ios', 'android', 'web');

-- 2. USERS (Supabase Auth UID as PK)
CREATE TABLE users (
  id            UUID         PRIMARY KEY,
  role          user_role    NOT NULL,
  phone         VARCHAR(20)  UNIQUE,
  name          VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);
-- If you already ran the old schema, run this migration in Supabase SQL editor:
-- ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- 3. FACE_ANALYSES
CREATE TABLE face_analyses (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  master_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  geometry_json JSONB        NOT NULL DEFAULT '{}',
  result_json   JSONB        NOT NULL DEFAULT '{}',
  photo_url     TEXT,
  scheme_url    TEXT,
  overlay_url   TEXT,
  master_notes  TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX face_analyses_client_idx ON face_analyses(client_id);
CREATE INDEX face_analyses_master_idx ON face_analyses(master_id);

-- 4. APPOINTMENTS
CREATE TABLE appointments (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  master_id     UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ        NOT NULL,
  status        appointment_status NOT NULL DEFAULT 'pending',
  analysis_id   UUID               REFERENCES face_analyses(id) ON DELETE SET NULL,
  service       VARCHAR(100)       NOT NULL DEFAULT 'Наращивание ресниц',
  notes         TEXT,
  created_at    TIMESTAMPTZ        DEFAULT NOW()
);

CREATE INDEX appointments_client_idx ON appointments(client_id);
CREATE INDEX appointments_master_idx ON appointments(master_id);
CREATE INDEX appointments_scheduled_idx ON appointments(scheduled_at);

-- 5. MESSAGES (P2P Chat)
CREATE TABLE messages (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT         NOT NULL,
  type          message_type NOT NULL DEFAULT 'text',
  analysis_id   UUID         REFERENCES face_analyses(id) ON DELETE SET NULL,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX messages_sender_idx   ON messages(sender_id);
CREATE INDEX messages_receiver_idx ON messages(receiver_id);
CREATE INDEX messages_created_idx  ON messages(created_at);

-- 6. MASTER_CLIENTS (Many-to-many)
CREATE TABLE master_clients (
  master_id  UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id  UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linked_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (master_id, client_id)
);

-- 7. PUSH_TOKENS (FCM)
CREATE TABLE push_tokens (
  user_id    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token  TEXT          NOT NULL,
  platform   platform_type NOT NULL DEFAULT 'web',
  updated_at TIMESTAMPTZ   DEFAULT NOW(),
  PRIMARY KEY (user_id, platform)
);

-- ============================================================
--  ROW LEVEL SECURITY (RLS) — Section 8 of TZ
-- ============================================================

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_analyses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens    ENABLE ROW LEVEL SECURITY;

-- users: each sees only their own row (+ masters can see their clients via join)
CREATE POLICY "own_profile_select" ON users
  FOR SELECT USING (
    auth.uid() = id
    OR id IN (
      SELECT client_id FROM master_clients WHERE master_id = auth.uid()
      UNION
      SELECT master_id FROM master_clients WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "own_profile_update" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "own_profile_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- face_analyses: client sees own, master sees linked clients'
CREATE POLICY "analysis_select" ON face_analyses
  FOR SELECT USING (
    client_id = auth.uid()
    OR master_id = auth.uid()
    OR (
      master_id IS NULL
      AND client_id IN (
        SELECT client_id FROM master_clients WHERE master_id = auth.uid()
      )
    )
  );

CREATE POLICY "analysis_insert" ON face_analyses
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "analysis_master_notes" ON face_analyses
  FOR UPDATE USING (master_id = auth.uid())
  WITH CHECK (master_id = auth.uid());

-- appointments: both parties
CREATE POLICY "appointment_access" ON appointments
  FOR ALL USING (
    client_id = auth.uid() OR master_id = auth.uid()
  );

-- messages: only participants
CREATE POLICY "chat_select" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "chat_insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "chat_read_update" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- master_clients: master can read/write their own
CREATE POLICY "master_clients_select" ON master_clients
  FOR SELECT USING (master_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "master_clients_insert" ON master_clients
  FOR INSERT WITH CHECK (master_id = auth.uid() OR client_id = auth.uid());

-- push_tokens: own only
CREATE POLICY "push_tokens_own" ON push_tokens
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
--  SUPABASE REALTIME — enable for P2P chat
-- ============================================================
-- Run in Supabase Dashboard → Replication → enable for:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
--  STORAGE BUCKETS (create via Dashboard or CLI)
-- ============================================================
-- bucket: avatars       (public)
-- bucket: analyses      (private, RLS via service role)
