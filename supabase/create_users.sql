-- ============================================
-- CREAR USUARIOS: Milan y Adeline Brossard
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Primero necesitas crear los usuarios en Authentication > Users
-- Email: milan@syntalys.ch, Password: (el que quieras)
-- Email: adeline.brossard@syntalys.ch, Password: (el que quieras)
-- Email: milan.concierge@syntalys.ch, Password: (el que quieras)
-- Email: adeline.concierge@syntalys.ch, Password: (el que quieras)

-- Una vez creados, obtén sus UUIDs y reemplaza abajo:

-- ============================================
-- OPCIÓN 1: Si quieres crear los usuarios con SQL (requiere extensión pgsodium)
-- ============================================

-- Crear usuarios en auth.users (esto normalmente se hace desde el Dashboard)
-- Los passwords deben ser hasheados con crypt()

-- ============================================
-- OPCIÓN 2: Después de crear usuarios en Dashboard, ejecutar esto:
-- ============================================

-- Reemplaza estos UUIDs con los reales después de crear los usuarios en el Dashboard
-- Puedes ver los UUIDs en Authentication > Users

-- Variables (reemplazar con UUIDs reales):
-- MILAN_PLAYER_ID = 'uuid-del-usuario-milan-player'
-- MILAN_CONCIERGE_ID = 'uuid-del-usuario-milan-concierge'
-- ADELINE_PLAYER_ID = 'uuid-del-usuario-adeline-player'
-- ADELINE_CONCIERGE_ID = 'uuid-del-usuario-adeline-concierge'

-- ============================================
-- SCRIPT PARA EJECUTAR DESPUÉS DE CREAR USUARIOS EN DASHBOARD:
-- ============================================

-- 1. Milan como Jugador (milan@syntalys.ch)
INSERT INTO public.profiles (id, full_name, phone, locale)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Reemplazar con UUID real
  'Milan',
  NULL,
  'fr'
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Reemplazar con UUID real
  'player'
) ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Milan como Conciergerie (milan.concierge@syntalys.ch)
INSERT INTO public.profiles (id, full_name, phone, locale)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- Reemplazar con UUID real
  'Milan (Conciergerie)',
  NULL,
  'fr'
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- Reemplazar con UUID real
  'concierge'
) ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Adeline como Jugadora (adeline.brossard@syntalys.ch)
INSERT INTO public.profiles (id, full_name, phone, locale)
VALUES (
  '00000000-0000-0000-0000-000000000003', -- Reemplazar con UUID real
  'Adeline Brossard',
  NULL,
  'fr'
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000003', -- Reemplazar con UUID real
  'player'
) ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Adeline como Conciergerie (adeline.concierge@syntalys.ch)
INSERT INTO public.profiles (id, full_name, phone, locale)
VALUES (
  '00000000-0000-0000-0000-000000000004', -- Reemplazar con UUID real
  'Adeline Brossard (Conciergerie)',
  NULL,
  'fr'
) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000004', -- Reemplazar con UUID real
  'concierge'
) ON CONFLICT (user_id, role) DO NOTHING;
