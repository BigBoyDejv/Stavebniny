import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

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
      console.warn('PHP Auth error:', err)
    }

    setSession(null)
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
      console.warn('PHP Login error:', err)
      return { error: { message: err.message || 'Nesprávne prihlasovacie údaje' } }
    }
    return { error: { message: 'Nesprávne prihlasovacie údaje' } }
  }

  const logout = async () => {
    localStorage.removeItem('stavebniny_dev_session')
    try {
      await api.auth.logout()
    } catch (err) {}
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
