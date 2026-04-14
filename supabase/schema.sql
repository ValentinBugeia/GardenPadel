-- ============================================================
-- Garden Padel Club — Supabase Schema
-- À exécuter dans l'éditeur SQL de ton projet Supabase
-- ============================================================

-- ── 1. TABLE PROFILES ────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  first_name  TEXT NOT NULL DEFAULT '',
  last_name   TEXT NOT NULL DEFAULT '',
  address     TEXT DEFAULT '',
  birth_date  DATE,
  level       TEXT DEFAULT 'Débutant',
  role        TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  credits     INTEGER DEFAULT 5,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire tous les profils" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateur peut modifier son profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Utilisateur peut créer son profil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger : crée automatiquement le profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, address, birth_date, level, role, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    NULLIF(NEW.raw_user_meta_data->>'birth_date', '')::DATE,
    COALESCE(NEW.raw_user_meta_data->>'level', 'Débutant'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE((NEW.raw_user_meta_data->>'credits')::INTEGER, 5)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 1b. FONCTION deduct_credit ───────────────────────────────
-- Permet à tout utilisateur authentifié de déduire 1 crédit sur n'importe quel profil
-- (nécessaire pour les réservations multi-joueurs, contourne la RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.deduct_credit(player_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET credits = GREATEST(0, credits - 1)
  WHERE id = player_id;
END;
$$;

-- ── 2. TABLE EVENTS ──────────────────────────────────────────
CREATE TABLE public.events (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('tournoi','seminaire','coaching','soiree','autre')),
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  slot        TEXT DEFAULT '',
  court_ids   INTEGER[] DEFAULT '{}',
  max_places  INTEGER,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les événements" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Authentifiés peuvent gérer les événements" ON public.events
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 3. TABLE RESERVATIONS ────────────────────────────────────
CREATE TABLE public.reservations (
  id               TEXT PRIMARY KEY,
  court_id         INTEGER NOT NULL,
  court_name       TEXT NOT NULL,
  date             DATE NOT NULL,
  slot             TEXT NOT NULL,
  user_id          UUID REFERENCES public.profiles(id),
  user_first_name  TEXT,
  user_last_name   TEXT,
  user_email       TEXT,
  players          JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire toutes les réservations" ON public.reservations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authentifiés peuvent créer des réservations" ON public.reservations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authentifiés peuvent supprimer des réservations" ON public.reservations
  FOR DELETE USING (auth.role() = 'authenticated');

-- ── 4. TABLE EVENT_REGISTRATIONS ─────────────────────────────
CREATE TABLE public.event_registrations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_key     TEXT NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_key, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire les inscriptions" ON public.event_registrations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateur gère ses inscriptions" ON public.event_registrations
  FOR ALL USING (user_id = auth.uid());

-- ── 5. TABLE BADGES ──────────────────────────────────────────
CREATE TABLE public.badges (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '',
  color       TEXT DEFAULT '#6ab5db',
  permissions TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les badges" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "Authentifiés peuvent gérer les badges" ON public.badges
  FOR ALL USING (auth.role() = 'authenticated');

-- ── 6. TABLE USER_BADGES ─────────────────────────────────────
CREATE TABLE public.user_badges (
  user_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifiés peuvent lire les attributions" ON public.user_badges
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authentifiés peuvent gérer les attributions" ON public.user_badges
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED : Badges par défaut
-- ============================================================
INSERT INTO public.badges (id, name, emoji, color, permissions, created_at) VALUES
  ('badge-coach',     'Coach',             '🎾', '#6ab5db', ARRAY['book_free','manage_coaching','view_planning'],                                    '2026-01-01T00:00:00Z'),
  ('badge-admin',     'Administrateur',    '⚙️', '#e98eaa', ARRAY['book_free','manage_coaching','manage_soirees','view_planning','admin_access'],    '2026-01-01T00:00:00Z'),
  ('badge-vip',       'VIP',               '⭐', '#f59e0b', ARRAY['book_free'],                                                                      '2026-01-01T00:00:00Z'),
  ('badge-animateur', 'Animateur Soirée',  '🎉', '#a855f7', ARRAY['manage_soirees','view_planning'],                                                 '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  emoji       = EXCLUDED.emoji,
  color       = EXCLUDED.color,
  permissions = EXCLUDED.permissions;

-- ============================================================
-- SEED : Événements
-- ============================================================
INSERT INTO public.events (id, type, title, date, slot, court_ids, description, created_at) VALUES
  ('ev-seed-001','tournoi',  'Open Garden Printemps — J1',        '2026-04-18','09h – 20h',    '{}',    'P25 à P100 · Mixte · 32 équipes · Phase de poules',       '2026-01-01T00:00:00Z'),
  ('ev-seed-002','tournoi',  'Open Garden Printemps — Finale',    '2026-04-19','10h – 18h',    '{}',    'Demi-finales & Finale · Dotation 500 €',                   '2026-01-01T00:00:00Z'),
  ('ev-seed-003','tournoi',  'Tournoi Dames & Juniors — J1',      '2026-05-09','09h – 19h',    '{}',    'Tous niveaux · Dames / -18 ans · 24 équipes',              '2026-01-01T00:00:00Z'),
  ('ev-seed-004','tournoi',  'Tournoi Dames & Juniors — Finale',  '2026-05-10','10h – 17h',    '{}',    'Remise des trophées & cadeaux',                            '2026-01-01T00:00:00Z'),
  ('ev-seed-005','tournoi',  'Garden Summer Champ. — J1',         '2026-06-13','08h30 – 21h',  '{}',    'P100+ · Open · 48 équipes · Phase de groupes',             '2026-01-01T00:00:00Z'),
  ('ev-seed-006','tournoi',  'Garden Summer Champ. — Finale',     '2026-06-14','10h – 19h',    '{}',    'Quarts, demis & grande finale · Dotation 1 500 €',         '2026-01-01T00:00:00Z'),
  ('ev-seed-007','soiree',   'Soirée Match de Foot ⚽',            '2026-04-11','19h – Minuit', '{}',    'UEFA Champions League en direct · Bar ouvert',             '2026-01-01T00:00:00Z'),
  ('ev-seed-008','soiree',   'Padel by Night 🌙',                  '2026-04-17','20h – 01h',    '{}',    'Tournoi nocturne LED · DJ set · Terrasse',                 '2026-01-01T00:00:00Z'),
  ('ev-seed-009','soiree',   'Soirée Pizza & Padel 🍕',            '2026-04-25','19h – 23h',    '{}',    'Formule dîner + 1h30 de jeu inclus',                      '2026-01-01T00:00:00Z'),
  ('ev-seed-010','soiree',   'Fiesta Cinco de Mayo 🇲🇽',           '2026-05-02','19h30 – Minuit','{}',   'Soirée mexicaine · Cocktails & tapas · Animations',        '2026-01-01T00:00:00Z'),
  ('ev-seed-011','soiree',   'Afterwork DJ Set 🎧',                '2026-05-16','18h – 23h',    '{}',    'Live DJ · Bar & terrasse · Entrée libre',                  '2026-01-01T00:00:00Z'),
  ('ev-seed-012','soiree',   'Soirée Roland-Garros 🎾',            '2026-05-30','19h – 23h',    '{}',    'Retransmission live · Apéro dinatoire',                   '2026-01-01T00:00:00Z'),
  ('ev-seed-013','soiree',   'Garden Summer Party ☀️',             '2026-06-20','18h – 02h',    '{}',    'Fête de l''été · Concert live · BBQ & cocktails',          '2026-01-01T00:00:00Z'),
  ('ev-seed-014','seminaire','Séminaire TotalEnergies',            '2026-04-15','09h – 18h',    '{1,2}', 'Terrains 1 & 2 réservés · Repas d''entreprise inclus',     '2026-01-01T00:00:00Z'),
  ('ev-seed-015','seminaire','Team Building Bouygues',             '2026-04-22','14h – 19h',    '{3}',   'Terrain 3 réservé · Coach encadrant',                      '2026-01-01T00:00:00Z'),
  ('ev-seed-016','seminaire','Séminaire Airbus',                   '2026-05-06','08h – 20h',    '{1,2,3}','Tous les terrains réservés · Journée complète',          '2026-01-01T00:00:00Z'),
  ('ev-seed-017','seminaire','Team Building Orange',               '2026-05-20','13h – 18h',    '{2}',   'Terrain 2 réservé · Initiation padel',                     '2026-01-01T00:00:00Z'),
  ('ev-seed-018','seminaire','Séminaire SNCF',                     '2026-06-03','09h – 17h',    '{1,2}', 'Terrains 1 & 2 réservés · Lunch sur place',               '2026-01-01T00:00:00Z'),
  ('ev-seed-019','seminaire','Team Building CMA CGM',              '2026-06-10','10h – 18h',    '{3}',   'Terrain 3 réservé · Tournoi interne entreprise',           '2026-01-01T00:00:00Z'),
  ('ev-seed-020','coaching', 'Coaching Débutants — Cours 1',       '2026-04-10','09:30 – 11:00','{3}',  'Initiation : prise de raquette, service et déplacements',  '2026-01-01T00:00:00Z'),
  ('ev-seed-021','coaching', 'Coaching Perfectionnement',           '2026-04-10','14:00 – 15:30','{1}', 'Améliorer la régularité et le jeu de fond de court',       '2026-01-01T00:00:00Z'),
  ('ev-seed-022','coaching', 'Coaching Technique — Coup droit',    '2026-04-14','17:00 – 18:30','{2}', 'Travail spécifique coup droit & montée au filet',           '2026-01-01T00:00:00Z'),
  ('ev-seed-023','coaching', 'Coaching Compétition P100+',         '2026-04-16','09:30 – 11:00','{1}', 'Préparation match · Tactique et gestion du stress',         '2026-01-01T00:00:00Z'),
  ('ev-seed-024','coaching', 'Coaching Débutants — Cours 2',       '2026-04-21','09:30 – 11:00','{3}', 'Service, position et déplacements en match',                '2026-01-01T00:00:00Z'),
  ('ev-seed-025','coaching', 'Coaching Smash & Volée',             '2026-04-23','14:00 – 15:30','{2}', 'Maîtriser la volée haute et le smash offensif',             '2026-01-01T00:00:00Z'),
  ('ev-seed-026','coaching', 'Coaching Débutants — Cours 3',       '2026-04-28','09:30 – 11:00','{3}', 'Échanges et régularité · Mise en situation',               '2026-01-01T00:00:00Z'),
  ('ev-seed-027','coaching', 'Coaching Tactique — Gestion du match','2026-04-30','17:00 – 18:30','{1}','Analyse tactique et exercices de décision',                '2026-01-01T00:00:00Z'),
  ('ev-seed-028','coaching', 'Coaching Débutants — Cours 4',       '2026-05-05','09:30 – 11:00','{3}', 'Jeux en situation réelle · Bilan de la session',            '2026-01-01T00:00:00Z'),
  ('ev-seed-029','coaching', 'Coaching Revers & Lob',              '2026-05-07','14:00 – 15:30','{2}', 'Revers à 2 mains et utilisation du lob défensif',           '2026-01-01T00:00:00Z'),
  ('ev-seed-030','coaching', 'Coaching Préparation Tournoi',        '2026-05-12','09:30 – 11:00','{1}', 'Simulation matchs · Stratégie de tournoi Garden Padel',    '2026-01-01T00:00:00Z'),
  ('ev-seed-031','coaching', 'Coaching Perfectionnement Niveau P',  '2026-05-19','14:00 – 15:30','{2}', 'Pour joueurs P100 à P500 · Travail technique ciblé',       '2026-01-01T00:00:00Z'),
  ('ev-seed-032','coaching', 'Coaching Jeunes — -18 ans',           '2026-05-26','09:30 – 11:00','{3}', 'Stage découverte pour les jeunes talents du club',          '2026-01-01T00:00:00Z'),
  ('ev-seed-033','coaching', 'Coaching Pré-estival',               '2026-06-02','17:00 – 18:30','{1}', 'Se préparer pour l''été · Tous niveaux bienvenus',          '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- APRÈS avoir créé le compte admin dans Supabase Dashboard
-- (Authentication → Users → Add user → admin@gardenpadel.fr / Admin2026!)
-- Exécuter cette requête en remplaçant <UUID_ADMIN> par l'UUID obtenu :
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin', first_name = 'Admin', last_name = 'Garden',
--     address = 'Six-Fours-Les-Plages, Var (83)', birth_date = '1989-01-01',
--     level = 'P500', credits = 10
-- WHERE email = 'admin@gardenpadel.fr';
