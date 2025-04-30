// _supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nwytzenfzgakwjxtrors.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eXR6ZW5memdha3dqeHRyb3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzEyOTYsImV4cCI6MjA2MTU0NzI5Nn0.SooZmrQQ-_ISKDdxZGa2awJAMBPeHAazIdB-TOYtH4U'

export const supabase = createClient(supabaseUrl, supabaseKey)
