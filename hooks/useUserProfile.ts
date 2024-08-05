// hooks/useUserProfile.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export function useUserProfile() {
    const queryClient = useQueryClient()

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            return data
        },
        /**
         * Stale time is 5 minutes
         */
        staleTime: 1000 * 60 * 5,
    })

    const updateProfile = async (updates: Partial<typeof profile>) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user logged in')

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .single()

        if (error) throw error

        // Update the cache
        queryClient.setQueryData(['userProfile'], data)

        return data
    }

    return { profile, isLoading, error, updateProfile }
}