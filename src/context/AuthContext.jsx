import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    // Check local dev session first
    const localDevSession = localStorage.getItem('stavebniny_dev_session')
    if (localDevSession) {
      try {
        const parsed = JSON.parse(localDevSession)
        setSession(parsed)
        setLoading(false)
        return
      } catch (e) {}
    }

    try {
      const data = await api.auth.getSession()
      if (data && data.session) {
        setSession(data.session)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('PHP Auth fallback to Supabase:', err)
    }

    if (supabase && supabase.auth) {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          setSession(data.session)
          setLoading(false)
          return
        }
      } catch (e) {}
    }
    setSession(null)
    setLoading(false)
  }

  useEffect(() => {
    checkSession()
  }, [])

  const login = async (email, password) => {
    // 1. Try PHP API login if active
    try {
      const data = await api.auth.login(email, password)
      if (data && data.session) {
        setSession(data.session)
        return { session: data.session, error: null }
      }
    } catch (err) {
      console.warn('PHP Login error, trying Supabase / local auth:', err)
    }

    // 2. Try Supabase Auth
    if (supabase && supabase.auth) {
      try {
        const res = await supabase.auth.signInWithPassword({ email, password })
        if (res.data?.session) {
          setSession(res.data.session)
          return { session: res.data.session, error: null }
        }
      } catch (sbErr) {
        console.warn('Supabase signIn error:', sbErr)
      }
    }

    // 3. Dev Admin Fallback (for localhost / offline development)
    if (
      (email.trim().toLowerCase() === 'kubik@stavivalubela.sk' || email.trim().toLowerCase() === 'admin@stavivalubela.sk') &&
      password === 'admin123'
    ) {
      const devSession = {
        user: { email: email.trim().toLowerCase(), role: 'admin', id: 'admin-dev-id' },
        access_token: 'dev-token-' + Date.now(),
        expires_at: Date.now() + 86400000
      }
      localStorage.setItem('stavebniny_dev_session', JSON.stringify(devSession))
      setSession(devSession)
      return { session: devSession, error: null }
    }

    return { error: { message: 'Nesprávne prihlasovacie údaje' } }
  }

  const logout = async () => {
    localStorage.removeItem('stavebniny_dev_session')
    try {
      await api.auth.logout()
    } catch (err) {}
    if (supabase && supabase.auth) {
      try { await supabase.auth.signOut() } catch(e) {}
    }
    setSession(null)
  }

  const isAdmin = !!session

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, login, logout, refreshSession: checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
