import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) 
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        // Ambil role dari metadata
        const userRole = session.user.app_metadata?.role || 'student'
        setRole(userRole)
      } else {
        setUser(null)
        setRole(null)
      }
      
      setLoading(false)
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const userRole = session.user.app_metadata?.role || 'student'
        setRole(userRole)
      } else {
        setUser(null)
        setRole(null)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const register = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    // Kita kirimkan 'role' ke seluruh aplikasi
    <AuthContext.Provider value={{ user, role, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)