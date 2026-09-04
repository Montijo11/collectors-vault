export type Role = 'collector' | 'admin';

export type Condition = 'Mint' | 'Loose' | 'Creased' | 'Bent Card' | 'Opened';

export type Rarity =
  | 'Mainline'
  | 'Premium'
  | 'Silver Series'
  | 'Super Treasure Hunt'
  | 'Treasure Hunt'
  | 'RLC'
  | 'Convention Exclusive'
  | 'Other';

export type ForumCategory =
  | 'updates'
  | 'hunting_logs'
  | 'error_variations'
  | 'trade_listings'
  | 'general_chat'
  | 'show_and_tell';

export interface Profile {
  id: string;
  username: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface ReleaseSet {
  id: string;
  series_name: string;
  year: number;
  set_size: number;
  rarity_tier: Rarity | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Casting {
  id: string;
  casting_name: string;
  series: string | null;
  year: number | null;
  toy_number: string | null;
  barcode_upc: string | null;
  rarity: Rarity | null;
  image_url: string | null;
  set_id: string | null;
  position_in_set: number | null;
  created_at: string;
}

export interface RegistryItem {
  id: string;
  owner_id: string;
  casting_id: string | null;
  set_id: string | null;
  casting_name: string;
  series: string | null;
  year: number | null;
  toy_number: string | null;
  barcode_upc: string | null;
  condition: Condition;
  rarity: Rarity | null;
  estimated_value: number;
  notes: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  owner_username?: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  author_username?: string;
  category: ForumCategory;
  title: string;
  body: string;
  trade_offered: string | null;
  trade_wanted: string | null;
  trade_condition: string | null;
  trade_shipping: string | null;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_LABELS: Record<ForumCategory, string> = {
  updates: 'Updates',
  hunting_logs: 'Hunting Logs',
  error_variations: 'Error & Variation Discoveries',
  trade_listings: 'Trade Listings',
  general_chat: 'General Chat',
  show_and_tell: 'Show & Tell',
};

export const RARITY_OPTIONS: Rarity[] = [
  'Mainline',
  'Premium',
  'Silver Series',
  'Super Treasure Hunt',
  'Treasure Hunt',
  'RLC',
  'Convention Exclusive',
  'Other',
];

export const CONDITION_OPTIONS: Condition[] = ['Mint', 'Loose', 'Creased', 'Bent Card', 'Opened'];
