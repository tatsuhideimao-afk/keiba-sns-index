import { createClient } from "@supabase/supabase-js";

// 公開サイトは anon キーで races/horses/snapshots のみ read（RLS準拠・SPEC §3）。
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

export type Race = {
  id: number;
  race_key: string;
  name: string;
  race_date: string;
  racecourse: string | null;
  race_no: number | null;
};

export type Horse = {
  id: number;
  race_id: number;
  umaban: number | null;
  name: string;
};

export type Snapshot = {
  race_id: number;
  horse_id: number;
  as_of: string;
  honmei_count: number;
  taiko_count: number;
  ana_count: number;
  post_count: number;
  media_count: number;
  kaime_count: number;
  total_posts: number;
  support_rate: number;
  honmei_rate: number;
  sns_index: number;
};
