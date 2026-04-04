import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { database } from '../config/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isLoaded) return

      console.log('🔍 AuthContext: syncUserWithSupabase called', { isLoaded, user: !!user })
      
      try {
        if (user) {
          console.log('👤 AuthContext: User found, syncing to Supabase', {
            userId: user.id,
            email: user.emailAddresses?.[0]?.emailAddress,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            imageUrl: user.imageUrl
          })

          // Sync Clerk user data with Supabase
          const { data, error } = await database.upsertProfile(user)
          
          if (error) {
            console.error('❌ AuthContext: Error syncing user with Supabase:', error)
            setError(error.message)
          } else {
            console.log('✅ AuthContext: User synced with Supabase successfully:', data)
            setError(null)
          }
        } else {
          console.log('🔍 AuthContext: No user to sync')
        }
      } catch (err) {
        console.error('❌ AuthContext: Error in auth sync:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    syncUserWithSupabase()
  }, [user, isLoaded])

  const handleSignOut = async () => {
    try {
      setError(null)
      await signOut()
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    signOut: handleSignOut,
    isAuthenticated: !!user,
    isLoaded
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
