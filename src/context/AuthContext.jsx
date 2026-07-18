import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
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
        setSession(data?.session || null)
      } catch (e) {
        setSession(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkSession()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await api.auth.login(email, password)
      if (data && data.session) {
        setSession(data.session)
        return { session: data.session, error: null }
      }
    } catch (err) {
      console.warn('PHP Login error, trying Supabase:', err)
    }

    if (supabase && supabase.auth) {
      return await supabase.auth.signInWithPassword({ email, password })
    }

    return { error: { message: 'Nepodarilo sa prihlásiť' } }
  }

  const logout = async () => {
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
