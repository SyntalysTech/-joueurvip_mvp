-- VIP Joueur MVP - Schema inicial
-- Base de datos real, sin datos ficticios

-- ============================================
-- EXTENSIONES
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
create type app_role as enum ('player', 'concierge', 'admin');
create type request_status as enum ('new', 'in_progress', 'waiting_player', 'confirmed', 'completed', 'cancelled');
create type message_sender as enum ('player', 'concierge');

-- ============================================
-- TABLA: profiles
-- Un perfil por usuario autenticado
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  locale text not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLA: user_roles
-- Roles de usuario (player, concierge, admin)
-- ============================================
create table public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);

-- ============================================
-- TABLA: categories
-- Categorías de servicios
-- ============================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_fr text not null,
  icon text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- TABLA: services
-- Servicios dentro de cada categoría
-- ============================================
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null unique,
  name_fr text not null,
  description_fr text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_services_category on public.services(category_id);

-- ============================================
-- TABLA: requests
-- Solicitudes de los jugadores
-- ============================================
create table public.requests (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id),
  category_id uuid not null references public.categories(id),
  assigned_concierge_id uuid references auth.users(id),
  status request_status not null default 'new',
  title text not null,
  description text,
  priority int not null default 0,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_requests_player on public.requests(player_id);
create index idx_requests_status on public.requests(status);
create index idx_requests_concierge on public.requests(assigned_concierge_id);
create index idx_requests_created on public.requests(created_at desc);

-- ============================================
-- TABLA: messages
-- Mensajes entre jugador y conciergerie
-- ============================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender_type message_sender not null,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_messages_request on public.messages(request_id);
create index idx_messages_created on public.messages(created_at);

-- ============================================
-- DATOS ESTRUCTURALES: Categorías
-- Esto NO son datos ficticios, es la estructura del servicio
-- ============================================
insert into public.categories (slug, name_fr, icon, display_order) values
  ('voyage', 'Voyage', 'plane', 1),
  ('montres-bijoux', 'Montres & Bijoux', 'watch', 2),
  ('maroquinerie', 'Maroquinerie', 'briefcase', 3),
  ('immobilier', 'Immobilier', 'building', 4),
  ('automobile', 'Automobile', 'car', 5),
  ('conciergerie', 'Conciergerie', 'concierge-bell', 6),
  ('opticien', 'Opticien', 'glasses', 7),
  ('yacht', 'Yacht', 'anchor', 8),
  ('location', 'Location', 'key', 9),
  ('traiteur', 'Traiteur', 'utensils', 10),
  ('nurse', 'Nurse', 'heart-pulse', 11),
  ('art', 'Art', 'palette', 12),
  ('chauffeur', 'Chauffeur Privé', 'car-front', 13),
  ('securite', 'Sécurité Privée', 'shield', 14),
  ('spiritueux', 'Spiritueux', 'wine', 15),
  ('cuisinier', 'Cuisinier Privé', 'chef-hat', 16),
  ('cours', 'Cours Particuliers', 'graduation-cap', 17),
  ('fondation', 'Conseil Fondation', 'landmark', 18);

-- ============================================
-- DATOS ESTRUCTURALES: Servicios
-- ============================================
insert into public.services (category_id, slug, name_fr, display_order) values
  -- Voyage
  ((select id from categories where slug = 'voyage'), 'voyage-mesure', 'Voyage sur mesure', 1),
  ((select id from categories where slug = 'voyage'), 'vol-prive', 'Vol privé', 2),
  ((select id from categories where slug = 'voyage'), 'hotel-luxe', 'Hôtel de luxe', 3),

  -- Montres & Bijoux
  ((select id from categories where slug = 'montres-bijoux'), 'achat-montre', 'Achat montre', 1),
  ((select id from categories where slug = 'montres-bijoux'), 'achat-bijoux', 'Achat bijoux', 2),
  ((select id from categories where slug = 'montres-bijoux'), 'reparation', 'Réparation', 3),

  -- Maroquinerie
  ((select id from categories where slug = 'maroquinerie'), 'sac-luxe', 'Sac de luxe', 1),
  ((select id from categories where slug = 'maroquinerie'), 'accessoires', 'Accessoires cuir', 2),

  -- Immobilier
  ((select id from categories where slug = 'immobilier'), 'achat', 'Achat immobilier', 1),
  ((select id from categories where slug = 'immobilier'), 'vente', 'Vente immobilier', 2),
  ((select id from categories where slug = 'immobilier'), 'location-longue', 'Location longue durée', 3),
  ((select id from categories where slug = 'immobilier'), 'location-courte', 'Location courte durée', 4),
  ((select id from categories where slug = 'immobilier'), 'investissement', 'Investissement', 5),

  -- Automobile
  ((select id from categories where slug = 'automobile'), 'achat-auto', 'Achat véhicule', 1),
  ((select id from categories where slug = 'automobile'), 'leasing', 'Leasing', 2),
  ((select id from categories where slug = 'automobile'), 'location-auto', 'Location véhicule', 3),
  ((select id from categories where slug = 'automobile'), 'entretien', 'Entretien premium', 4),

  -- Conciergerie
  ((select id from categories where slug = 'conciergerie'), 'demande-speciale', 'Demande spéciale', 1),
  ((select id from categories where slug = 'conciergerie'), 'urgence', 'Urgence', 2),
  ((select id from categories where slug = 'conciergerie'), 'coordination', 'Coordination prestataires', 3),

  -- Opticien
  ((select id from categories where slug = 'opticien'), 'consultation', 'Consultation à domicile', 1),
  ((select id from categories where slug = 'opticien'), 'lunettes-luxe', 'Lunettes de luxe', 2),
  ((select id from categories where slug = 'opticien'), 'lentilles', 'Lentilles', 3),

  -- Yacht
  ((select id from categories where slug = 'yacht'), 'location-yacht', 'Location yacht', 1),
  ((select id from categories where slug = 'yacht'), 'achat-yacht', 'Achat yacht', 2),
  ((select id from categories where slug = 'yacht'), 'croisiere', 'Croisière privée', 3),

  -- Location
  ((select id from categories where slug = 'location'), 'vehicule-sport', 'Véhicule sport', 1),
  ((select id from categories where slug = 'location'), 'vehicule-luxe', 'Véhicule luxe', 2),
  ((select id from categories where slug = 'location'), 'utilitaire', 'Utilitaire', 3),
  ((select id from categories where slug = 'location'), 'autre-location', 'Autre location', 4),

  -- Traiteur
  ((select id from categories where slug = 'traiteur'), 'evenement', 'Événement', 1),
  ((select id from categories where slug = 'traiteur'), 'repas-quotidien', 'Repas quotidien', 2),
  ((select id from categories where slug = 'traiteur'), 'reception', 'Réception', 3),

  -- Nurse
  ((select id from categories where slug = 'nurse'), 'garde-enfant', 'Garde d''enfant', 1),
  ((select id from categories where slug = 'nurse'), 'nurse-nuit', 'Nurse de nuit', 2),
  ((select id from categories where slug = 'nurse'), 'accompagnement', 'Accompagnement', 3),

  -- Art
  ((select id from categories where slug = 'art'), 'acquisition', 'Acquisition œuvre', 1),
  ((select id from categories where slug = 'art'), 'conseil-art', 'Conseil artistique', 2),
  ((select id from categories where slug = 'art'), 'evenement-prive', 'Événement privé', 3),

  -- Chauffeur
  ((select id from categories where slug = 'chauffeur'), 'trajet-simple', 'Trajet simple', 1),
  ((select id from categories where slug = 'chauffeur'), 'mise-disposition', 'Mise à disposition', 2),
  ((select id from categories where slug = 'chauffeur'), 'transfert-aeroport', 'Transfert aéroport', 3),

  -- Sécurité
  ((select id from categories where slug = 'securite'), 'protection-rapprochee', 'Protection rapprochée', 1),
  ((select id from categories where slug = 'securite'), 'securite-domicile', 'Sécurité domicile', 2),
  ((select id from categories where slug = 'securite'), 'audit-securite', 'Audit sécurité', 3),

  -- Spiritueux
  ((select id from categories where slug = 'spiritueux'), 'achat-spiritueux', 'Achat spiritueux', 1),
  ((select id from categories where slug = 'spiritueux'), 'cave-privee', 'Cave privée', 2),
  ((select id from categories where slug = 'spiritueux'), 'conseil-sommelier', 'Conseil sommelier', 3),

  -- Cuisinier
  ((select id from categories where slug = 'cuisinier'), 'chef-domicile', 'Chef à domicile', 1),
  ((select id from categories where slug = 'cuisinier'), 'repas-quotidiens', 'Repas quotidiens', 2),
  ((select id from categories where slug = 'cuisinier'), 'evenement-culinaire', 'Événement culinaire', 3),

  -- Cours Particuliers
  ((select id from categories where slug = 'cours'), 'soutien-scolaire', 'Soutien scolaire', 1),
  ((select id from categories where slug = 'cours'), 'langues', 'Langues', 2),
  ((select id from categories where slug = 'cours'), 'sport-enfant', 'Sport', 3),
  ((select id from categories where slug = 'cours'), 'musique', 'Musique', 4),

  -- Fondation
  ((select id from categories where slug = 'fondation'), 'creation-fondation', 'Création fondation', 1),
  ((select id from categories where slug = 'fondation'), 'conseil-philanthropique', 'Conseil philanthropique', 2),
  ((select id from categories where slug = 'fondation'), 'accompagnement-juridique', 'Accompagnement juridique', 3);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Activar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.requests enable row level security;
alter table public.messages enable row level security;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para obtener los roles del usuario actual
create or replace function public.get_user_roles()
returns setof app_role
language sql
security definer
stable
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

-- Función para verificar si el usuario tiene un rol específico
create or replace function public.has_role(required_role app_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

-- ============================================
-- POLÍTICAS RLS: profiles
-- ============================================
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Concierge can view all profiles"
  on public.profiles for select
  using (public.has_role('concierge') or public.has_role('admin'));

-- ============================================
-- POLÍTICAS RLS: user_roles
-- ============================================
create policy "Users can view own roles"
  on public.user_roles for select
  using (user_id = auth.uid());

create policy "Admin can manage all roles"
  on public.user_roles for all
  using (public.has_role('admin'));

-- ============================================
-- POLÍTICAS RLS: categories
-- ============================================
create policy "Anyone authenticated can view categories"
  on public.categories for select
  using (auth.uid() is not null and is_active = true);

create policy "Admin can manage categories"
  on public.categories for all
  using (public.has_role('admin'));

-- ============================================
-- POLÍTICAS RLS: services
-- ============================================
create policy "Anyone authenticated can view services"
  on public.services for select
  using (auth.uid() is not null and is_active = true);

create policy "Admin can manage services"
  on public.services for all
  using (public.has_role('admin'));

-- ============================================
-- POLÍTICAS RLS: requests
-- ============================================
create policy "Players can view own requests"
  on public.requests for select
  using (player_id = auth.uid());

create policy "Players can create requests"
  on public.requests for insert
  with check (player_id = auth.uid() and public.has_role('player'));

create policy "Players can update own requests"
  on public.requests for update
  using (player_id = auth.uid());

create policy "Concierge can view all requests"
  on public.requests for select
  using (public.has_role('concierge') or public.has_role('admin'));

create policy "Concierge can update requests"
  on public.requests for update
  using (public.has_role('concierge') or public.has_role('admin'));

-- ============================================
-- POLÍTICAS RLS: messages
-- ============================================
create policy "Players can view messages of own requests"
  on public.messages for select
  using (
    exists (
      select 1 from public.requests
      where requests.id = messages.request_id
      and requests.player_id = auth.uid()
    )
  );

create policy "Players can create messages on own requests"
  on public.messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.requests
      where requests.id = request_id
      and requests.player_id = auth.uid()
    )
  );

create policy "Concierge can view all messages"
  on public.messages for select
  using (public.has_role('concierge') or public.has_role('admin'));

create policy "Concierge can create messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid() and
    (public.has_role('concierge') or public.has_role('admin'))
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_request_updated
  before update on public.requests
  for each row execute function public.handle_updated_at();

-- Trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
