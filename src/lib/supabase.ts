import { createClient } from '@supabase/supabase-js'


const SUPABASE_URL = "https://hdazymeaglqxdtmwtntj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYXp5bWVhZ2xxeGR0bXd0bnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NjUwNTAsImV4cCI6MjA3NDU0MTA1MH0.M_vre3Ly8XXSTDc4yUgTt6bxAdvAwgrdNr2F-gf_78E"


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)