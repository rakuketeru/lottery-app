// ✅ _supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🎯 关键检查点
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase credentials are missing. Check environment variables!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
