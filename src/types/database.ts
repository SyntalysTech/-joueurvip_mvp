export type AppRole = 'player' | 'concierge' | 'admin'

export type RequestStatus =
  | 'new'
  | 'in_progress'
  | 'waiting_player'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type MessageSender = 'player' | 'concierge'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  locale: string
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  created_at: string
}

export interface Category {
  id: string
  slug: string
  name_fr: string
  icon: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  category_id: string
  slug: string
  name_fr: string
  description_fr: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Request {
  id: string
  player_id: string
  service_id: string
  category_id: string
  assigned_concierge_id: string | null
  status: RequestStatus
  title: string
  description: string | null
  priority: number
  internal_notes: string | null
  created_at: string
  updated_at: string
}

export interface RequestWithDetails extends Request {
  service?: Service
  category?: Category
  player?: Profile
  concierge?: Profile
  messages_count?: number
  unread_count?: number
}

export interface Message {
  id: string
  request_id: string
  sender_id: string
  sender_type: MessageSender
  content: string
  is_read: boolean
  created_at: string
}

export interface MessageWithSender extends Message {
  sender?: Profile
}
