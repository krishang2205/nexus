import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mroshgdrpcbshomefmkq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_KqdC2KcCamEKxGB2LAJ42A_XsSDfiSL'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions for user profiles (Clerk integration)
export const database = {
  // Create or update user profile from Clerk user data
  upsertProfile: async (clerkUser) => {
    console.log('🔍 Database: upsertProfile called with:', clerkUser)
    
    const profileData = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
      avatar_url: clerkUser.imageUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📝 Database: Profile data to insert:', profileData)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Database: Supabase error:', error)
      } else {
        console.log('✅ Database: Profile upserted successfully:', data)
      }
      
      return { data, error }
    } catch (err) {
      console.error('❌ Database: Unexpected error:', err)
      return { data: null, error: err }
    }
  },

  // Get user profile by Clerk user ID
  getProfile: async (clerkUserId) => {
    console.log('🔍 Database: getProfile called for user:', clerkUserId)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clerkUserId)
        .single()
      
      if (error) {
        console.error('❌ Database: Get profile error:', error)
      } else {
        console.log('✅ Database: Profile retrieved:', data)
      }
      
      return { data, error }
    } catch (err) {
      console.error('❌ Database: Unexpected error in getProfile:', err)
      return { data: null, error: err }
    }
  },

  // Update user profile
  updateProfile: async (clerkUserId, updates) => {
    console.log('🔍 Database: updateProfile called for user:', clerkUserId, 'with updates:', updates)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clerkUserId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Database: Update profile error:', error)
      } else {
        console.log('✅ Database: Profile updated successfully:', data)
      }
      
      return { data, error }
    } catch (err) {
      console.error('❌ Database: Unexpected error in updateProfile:', err)
      return { data: null, error: err }
    }
  }
}
