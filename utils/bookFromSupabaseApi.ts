// utils\bookFromSupabaseApi.ts
import { createClient } from "@/utils/supabase/client";

export async function fetchBookFromSupabase<IBook>(bookId: string) {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', bookId)
            .single();

        if (error) {
            console.error('Error fetching book from Supabase:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching book from Supabase:', error);
        throw error;
    }
}

