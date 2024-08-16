// hooks/useUserProfile.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Session } from '@supabase/supabase-js'
import { UserProfile } from '@/interfaces/UserProfile'

const supabase = createClient()

interface UserProfileData {
  access_token: string | null;
  profile: UserProfile | null;
  session: Session | null;
}

export function useUserProfile() {
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery<UserProfileData, Error>({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return { profile: null, session: null, access_token: null }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (error) {
                console.log("User profile query error: ", error)
                throw error
            }

            return {
                access_token: session.access_token ?? '',
                profile: profile as UserProfile,
                session,
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!data?.session?.user) {
            console.log('No user logged in from update profile')
            throw new Error('No user logged in')
        }

        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', data.session.user.id)
            .single()

        if (error) {
            console.log("User profile update error: ", error)
            throw error
        }

        // Update the cache
        queryClient.setQueryData<UserProfileData>(['userProfile'], old => ({
            ...old!,
            profile: updatedProfile as UserProfile
        }))

        return updatedProfile as UserProfile
    }

    return { 
        access_token: data?.access_token ?? null, 
        error, 
        isLoading, 
        profile: data?.profile ?? null, 
        session: data?.session ?? null, 
        updateProfile 
    }
}