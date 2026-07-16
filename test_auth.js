import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wgikjivzjdaebzjzwmox.supabase.co'
const supabaseAnonKey = 'sb_publishable_oh28ovXn9xx-7GBLhCgB5g_ANdRIgwe'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const email = `test_confirm_${Date.now()}@example.com`
  const password = '123456'
  
  console.log("Registering test user:", email)
  const signupRes = await supabase.auth.signUp({ email, password })
  console.log("Signup error:", signupRes.error ? signupRes.error.message : 'None')
  console.log("Signup user:", signupRes.data.user ? signupRes.data.user.id : 'None')
  
  console.log("Attempting immediate sign in...")
  const loginRes = await supabase.auth.signInWithPassword({ email, password })
  console.log("Login error:", loginRes.error ? loginRes.error.message : 'None')
  console.log("Login session:", loginRes.data.session ? 'Success' : 'None')
}

run()
