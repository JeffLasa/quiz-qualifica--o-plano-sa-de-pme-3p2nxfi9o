import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface User extends RecordModel {
  email: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: unknown }>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<{ error: unknown }>
  confirmPasswordReset: (token: string, password: string) => Promise<{ error: unknown }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ user: null, error: null }),
  signOut: () => {},
  requestPasswordReset: async () => ({ error: null }),
  confirmPasswordReset: async () => ({ error: null }),
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>((pb.authStore.record as unknown as User) || null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Initial check
    if (pb.authStore.isValid && pb.authStore.record) {
      setUser(pb.authStore.record as unknown as User)
    } else {
      setUser(null)
    }
    setLoading(false)

    // Listen to changes
    const unsubscribe = pb.authStore.onChange((_, record) => {
      setUser((record as unknown as User) || null)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      const loggedUser = authData.record as unknown as User
      setUser(loggedUser)
      return { user: loggedUser, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmPasswordReset = async (token: string, password: string) => {
    try {
      await pb.collection('users').confirmPasswordReset(token, password, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
